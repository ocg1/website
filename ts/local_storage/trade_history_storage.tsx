import * as _ from 'lodash';
import {Fill} from 'ts/types';
import {configs} from 'ts/utils/configs';
import {constants} from 'ts/utils/constants';
import {localStorage} from 'ts/local_storage/local_storage';
import ethUtil = require('ethereumjs-util');
import * as BigNumber from 'bignumber.js';

const FILLS_KEY = 'fills';
const FILLS_LATEST_BLOCK = 'fillsLatestBlock';
const FILL_CLEAR_KEY = 'lastClearFillDate';

export const tradeHistoryStorage = {
    // Clear all fill related localStorage if we've updated the config variable in an update
    // that introduced a backward incompatible change requiring the user to re-fetch the fills from
    // the blockchain
    clearIfRequired() {
        const lastClearFillDate = localStorage.getItemIfExists(FILL_CLEAR_KEY);
        if (lastClearFillDate !== configs.lastLocalStorageFillClearanceDate) {
            const localStorageKeys = localStorage.getAllKeys();
            _.each(localStorageKeys, key => {
                if (_.startsWith(key, `${FILLS_KEY}-`) || _.startsWith(key, `${FILLS_LATEST_BLOCK}-`)) {
                    localStorage.removeItem(key);
                }
            });
        }
        localStorage.setItem(FILL_CLEAR_KEY, configs.lastLocalStorageFillClearanceDate);
    },
    addFillToUser(userAddress: string, networkId: number, fill: Fill) {
        const fillsByHash = this.getUserFillsByHash(userAddress, networkId);
        const fillHash = this._getFillHash(fill);
        const doesFillExist = !_.isUndefined(fillsByHash[fillHash]);
        if (doesFillExist) {
            return;
        }
        fillsByHash[fillHash] = fill;
        const userFillsJSONString = JSON.stringify(fillsByHash);
        const userFillsKey = this._getUserFillsKey(userAddress, networkId);
        localStorage.setItem(userFillsKey, userFillsJSONString);
    },
    getUserFillsByHash(userAddress: string, networkId: number): {[fillHash: string]: Fill} {
        const userFillsKey = this._getUserFillsKey(userAddress, networkId);
        const userFillsJSONString = localStorage.getItemIfExists(userFillsKey);
        if (_.isEmpty(userFillsJSONString)) {
            return {};
        }
        const userFillsByHash = JSON.parse(userFillsJSONString);
        _.each(userFillsByHash, (fill, hash) => {
          fill.paidMakerFee = new BigNumber(fill.paidMakerFee);
          fill.paidTakerFee = new BigNumber(fill.paidTakerFee);
          fill.filledTakerTokenAmount = new BigNumber(fill.filledTakerTokenAmount);
          fill.filledMakerTokenAmount = new BigNumber(fill.filledMakerTokenAmount);
        });
        return userFillsByHash;
    },
    getFillsLatestBlock(userAddress: string, networkId: number): number {
        const userFillsLatestBlockKey = this._getFillsLatestBlockKey(userAddress, networkId);
        const blockNumberStr = localStorage.getItemIfExists(userFillsLatestBlockKey);
        if (_.isEmpty(blockNumberStr)) {
            return constants.GENESIS_ORDER_BLOCK_BY_NETWORK_ID[networkId];
        }
        const blockNumber = _.parseInt(blockNumberStr);
        return blockNumber;
    },
    setFillsLatestBlock(userAddress: string, networkId: number, blockNumber: number) {
        const userFillsLatestBlockKey = this._getFillsLatestBlockKey(userAddress, networkId);
        localStorage.setItem(userFillsLatestBlockKey, `${blockNumber}`);
    },
    _getUserFillsKey(userAddress: string, networkId: number) {
        const userFillsKey = `${FILLS_KEY}-${userAddress}-${networkId}`;
        return userFillsKey;
    },
    _getFillsLatestBlockKey(userAddress: string, networkId: number) {
        const userFillsLatestBlockKey = `${FILLS_LATEST_BLOCK}-${userAddress}-${networkId}`;
        return userFillsLatestBlockKey;
    },
    _getFillHash(fill: Fill): string {
        const fillJSON = JSON.stringify(fill);
        const fillHash = ethUtil.sha256(fillJSON);
        return fillHash.toString('hex');
    },
};
