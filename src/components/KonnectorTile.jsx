import React from 'react'
import { connect } from 'react-redux'
import { translate } from 'cozy-ui/react/I18n'

import { getKonnectorTriggersCount } from '../reducers'

import Tile from './Tile'

const KonnectorTile = props => (
  <Tile route={props.route} subtitle={props.subtitle} {...props} />
)

const mapStateToProps = (state, props) => {
  const accountsCount = getKonnectorTriggersCount(state, props.konnector)
  return {
    footer: !!accountsCount && (
      <span className="item-count">{accountsCount}</span>
    )
  }
}

export default connect(mapStateToProps)(translate()(KonnectorTile))
