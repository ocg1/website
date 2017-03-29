import * as _ from 'lodash';
import * as React from 'react';
import {connect} from 'react-redux';
import {Store as ReduxStore, Dispatch} from 'redux';
import {State} from 'ts/redux/reducer';
import {constants} from 'ts/utils/constants';
import {Side, HashData, TokenBySymbol} from 'ts/types';
import {
    Demo as DemoComponent,
    DemoAllProps as DemoComponentAllProps,
    DemoPassedProps as DemoComponentPassedProps,
} from 'ts/components/demo';

interface MapStateToProps {
    blockchainErr: string;
    blockchainIsLoaded: boolean;
    hashData: HashData;
    networkId: number;
    tokenBySymbol: TokenBySymbol;
    userEtherBalance: number;
}

interface ConnectedState {}

interface ConnectedDispatch {
    dispatch: Dispatch<State>;
}

const mapStateToProps = (state: State, ownProps: DemoComponentAllProps): ConnectedState => {
    const receiveSymbol = state.sideToAssetToken[Side.receive].symbol;
    const depositSymbol = state.sideToAssetToken[Side.deposit].symbol;
    const hashData = {
        depositAmount: state.sideToAssetToken[Side.deposit].amount,
        depositTokenContractAddr: state.tokenBySymbol[depositSymbol].address,
        feeRecipientAddress: constants.NULL_ADDRESS,
        makerFee: 0,
        orderExpiryTimestamp: state.orderExpiryTimestamp,
        orderMakerAddress: state.orderMakerAddress,
        orderTakerAddress: state.orderTakerAddress !== '' ? state.orderTakerAddress : constants.NULL_ADDRESS,
        receiveAmount: state.sideToAssetToken[Side.receive].amount,
        receiveTokenContractAddr: state.tokenBySymbol[receiveSymbol].address,
        takerFee: 0,
    };
    return {
        blockchainErr: state.blockchainErr,
        blockchainIsLoaded: state.blockchainIsLoaded,
        networkId: state.networkId,
        hashData,
        tokenBySymbol: state.tokenBySymbol,
        userEtherBalance: state.userEtherBalance,
    };
};

const mapDispatchToProps = (dispatch: Dispatch<State>): ConnectedDispatch => {
    return {
        dispatch,
    };
};

export const Demo: React.ComponentClass<DemoComponentPassedProps> =
  connect(mapStateToProps, mapDispatchToProps)(DemoComponent);
