import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
import { Redirect } from 'react-router-dom';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import tokensSelectors from './../store/selectors/tokens';

import { validateTokenPair } from '../utils/validateTokenPair';
import { BASE_TOKENS, QUOTE_TOKENS, TOKEN_MAKER, TOKEN_WRAPPED_ETH } from '../constants';
import tokensReducer from './../store/reducers/tokens';
import { generateTradingPairs } from '../utils/generateTradingPairs';
import OasisMarketWidget from '../components/OasisMarketWidget';

const propTypes = PropTypes && {
  actions: PropTypes.object,
  defaultTokenPair: PropTypes.object
};

export class OasisTradeWrapper extends PureComponent {
  redirect() {
    const params = this.props.match.params;
    if (!validateTokenPair(params.baseToken, params.quoteToken, generateTradingPairs(BASE_TOKENS, QUOTE_TOKENS))) {
      const { baseToken, quoteToken } = this.props.defaultTokenPair.toJSON();
      if(baseToken === TOKEN_WRAPPED_ETH && quoteToken === TOKEN_MAKER) {
        return (
          <Redirect to={`/trade/${TOKEN_MAKER}/${TOKEN_WRAPPED_ETH}`}/>
        );
      } else {
        return (
          <Redirect to={`/trade/${baseToken}/${quoteToken}`}/>
        );
      }
    } else {
      this.props.actions.setActiveTokenPair({
        baseToken: params.baseToken, quoteToken: params.quoteToken
      });
      return null;
    }
  }
  render() {
    return this.redirect() || (
      <main>
        <OasisMarketWidget/>
      </main>
    );
  }
}

export function mapStateToProps(state) {
  return {
    validBaseTokensList: tokensSelectors.validBaseTokensList(state),
    validQuoteTokensList: tokensSelectors.validQuoteTokensList(state)
  };
}

export function mapDispatchToProps(dispatch) {
  const actions = {
    setActiveTokenPair: tokensReducer.actions.setActiveTokenPair
  };
  return { actions: bindActionCreators(actions, dispatch) };
}

OasisTradeWrapper.propTypes = propTypes;
OasisTradeWrapper.displayName = 'OasisTrade';
export default connect(mapStateToProps, mapDispatchToProps)(OasisTradeWrapper);
