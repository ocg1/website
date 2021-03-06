// Polyfills
import 'whatwg-fetch';

import * as React from 'react';
import {render} from 'react-dom';
import {Provider} from 'react-redux';
import {createStore, Store as ReduxStore} from 'redux';
import * as BigNumber from 'bignumber.js';
import {constants} from 'ts/utils/constants';
import {Landing} from 'ts/pages/landing/landing';
import {FAQ} from 'ts/pages/faq/faq';
import {About} from 'ts/pages/about/about';
import {Wiki} from 'ts/pages/wiki/wiki';
import {NotFound} from 'ts/pages/not_found';
import {createLazyComponent} from 'ts/lazy_component';
import {State, reducer} from 'ts/redux/reducer';
import {colors, getMuiTheme, MuiThemeProvider} from 'material-ui/styles';
import {Switch, BrowserRouter as Router, Route, Link, Redirect} from 'react-router-dom';
import {tradeHistoryStorage} from 'ts/local_storage/trade_history_storage';
import * as injectTapEventPlugin from 'react-tap-event-plugin';
import {WebsitePaths} from 'ts/types';
injectTapEventPlugin();

// By default BigNumber's `toString` method converts to exponential notation if the value has
// more then 20 digits. We want to avoid this behavior, so we set EXPONENTIAL_AT to a high number
BigNumber.config({
    EXPONENTIAL_AT: 1000,
});

// Check if we've introduced an update that requires us to clear the tradeHistory local storage entries
tradeHistoryStorage.clearIfRequired();

const CUSTOM_GREY = 'rgb(39, 39, 39)';
const CUSTOM_GREEN = 'rgb(102, 222, 117)';
const CUSTOM_DARKER_GREEN = 'rgb(77, 197, 92)';

import 'basscss/css/basscss.css';
import 'less/all.less';

const muiTheme = getMuiTheme({
    appBar: {
        height: 45,
        color: 'white',
        textColor: 'black',
    },
    palette: {
        pickerHeaderColor: constants.CUSTOM_BLUE,
        primary1Color: constants.CUSTOM_BLUE,
        primary2Color: constants.CUSTOM_BLUE,
        textColor: colors.grey700,
    },
    datePicker: {
        color: colors.grey700,
        textColor: 'white',
        calendarTextColor: 'white',
        selectColor: CUSTOM_GREY,
        selectTextColor: 'white',
    },
    timePicker: {
        color: colors.grey700,
        textColor: 'white',
        accentColor: 'white',
        headerColor: CUSTOM_GREY,
        selectColor: CUSTOM_GREY,
        selectTextColor: CUSTOM_GREY,
    },
    toggle: {
        thumbOnColor: CUSTOM_GREEN,
        trackOnColor: CUSTOM_DARKER_GREEN,
    },
});

// We pass modulePromise returning lambda instead of module promise,
// cause we only want to import the module when the user navigates to the page.
// At the same time webpack statically parses for System.import() to determine bundle chunk split points
// so each lazy import needs it's own `System.import()` declaration.
const LazyPortal = createLazyComponent(
    'Portal', () => System.import<any>(/* webpackChunkName: "portal" */'ts/containers/portal'),
);
const LazyZeroExJSDocumentation = createLazyComponent(
    'ZeroExJSDocumentation',
    () => System.import<any>(/* webpackChunkName: "zeroExDocs" */'ts/containers/zero_ex_js_documentation'),
);
const LazySmartContractsDocumentation = createLazyComponent(
    'SmartContractsDocumentation',
    () => System.import<any>(/* webpackChunkName: "smartContractDocs" */'ts/containers/smart_contracts_documentation'),
);

const store: ReduxStore<State> = createStore(reducer);
render(
    <Router>
        <div>
            <MuiThemeProvider muiTheme={muiTheme}>
                <Provider store={store}>
                    <div>
                        <Switch>
                            <Route exact={true} path="/" component={Landing as any} />
                            <Redirect from="/otc" to={`${WebsitePaths.Portal}`}/>
                            <Route path={`${WebsitePaths.Portal}`} component={LazyPortal} />
                            <Route path={`${WebsitePaths.FAQ}`} component={FAQ as any} />
                            <Route path={`${WebsitePaths.About}`} component={About as any} />
                            <Route path={`${WebsitePaths.Wiki}`} component={Wiki as any} />
                            <Route path={`${WebsitePaths.ZeroExJs}/:version?`} component={LazyZeroExJSDocumentation} />
                            <Route
                                path={`${WebsitePaths.SmartContracts}/:version?`}
                                component={LazySmartContractsDocumentation}
                            />
                            <Route component={NotFound as any} />
                        </Switch>
                    </div>
                </Provider>
            </MuiThemeProvider>
        </div>
  </Router>,
    document.getElementById('app'),
);
