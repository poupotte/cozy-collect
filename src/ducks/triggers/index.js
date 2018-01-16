import * as fromCozyClient from 'redux-cozy-client'
import { getAccount } from '../accounts'
import * as fromRunning from './running'

export const DOCTYPE = 'io.cozy.triggers'
const VALID_FREQUENCIES = ['weekly', 'daily']

const triggersCollectionKey = 'triggers'

const reducer = (state = {}, action) => {
  switch (action.type) {
    case 'LAUNCH_TRIGGER':
    case 'RECEIVE_NEW_DOCUMENT':
      return {
        ...state,
        running: fromRunning.reducer(state.running, action)
      }
    default:
      return state
  }
}

export default reducer

// CRUD action creators

export const fetchTriggers = () =>
  fromCozyClient.fetchTriggers(triggersCollectionKey, 'konnector')

export const createKonnectorTrigger = (
  konnector,
  account,
  folder,
  options = {}
) =>
  fromCozyClient.createTrigger(
    buildKonnectorTrigger(konnector, account, folder, options),
    {
      updateCollections: [triggersCollectionKey]
    }
  )

export const deleteTrigger = trigger =>
  fromCozyClient.deleteTrigger(trigger, {
    updateCollections: [triggersCollectionKey]
  })

export const launchTrigger = trigger => fromCozyClient.launchTrigger(trigger)

// Helpers
export const buildTriggerFrequencyOptions = (konnector, options) => {
  const { frequency } = konnector
  const { day, hours, minutes } = options

  const frequencyOptions = {
    frequency:
      frequency && VALID_FREQUENCIES.includes(frequency) ? frequency : 'weekly'
  }

  if (frequencyOptions.frequency === 'daily') {
    return {
      ...frequencyOptions,
      hours,
      minutes
    }
  }

  // weekly case by default
  return {
    ...frequencyOptions,
    day,
    hours,
    minutes
  }
}

export function buildKonnectorTrigger(
  konnector,
  account,
  folder,
  options = {}
) {
  const { day, hours, minutes } = buildTriggerFrequencyOptions(
    konnector,
    options
  )

  let workerArguments = {
    konnector: konnector.slug || konnector.attributes.slug,
    account: account._id
  }

  if (folder) {
    workerArguments['folder_to_save'] = folder._id
  }

  return {
    _type: DOCTYPE,
    attributes: {
      type: '@cron',
      arguments: `0 ${minutes || 0} ${hours || 0} * * ${day || '*'}`,
      worker: 'konnector',
      worker_arguments: workerArguments
    }
  }
}

// selectors

export const getKonnectorConnectedAccount = (
  state,
  konnector,
  existingAccounts = []
) => {
  // state is state.cozy
  const trigger = getTriggerByKonnector(state, konnector, existingAccounts)

  if (!trigger) return null

  return getAccount(state, trigger.message.account)
}

export const getKonnectorTriggers = (
  state,
  konnector,
  existingAccountIds = []
) => {
  return (
    (!!state.documents[DOCTYPE] &&
      Object.values(state.documents[DOCTYPE]).filter(trigger => {
        return (
          trigger.worker === 'konnector' &&
          trigger.message &&
          trigger.message.konnector === konnector.slug &&
          trigger.message.account &&
          existingAccountIds.includes(trigger.message.account)
        )
      })) ||
    []
  )
}

export const getTrigger = (state, id) =>
  !!state.documents &&
  !!state.documents[DOCTYPE] &&
  state.documents[DOCTYPE][id]

export const getTriggerByKonnector = (
  state,
  konnector,
  existingAccountIds = []
) => {
  // state is state.cozy
  if (!konnector || !state.documents || !state.documents[DOCTYPE]) return null
  const trigger = Object.values(state.documents[DOCTYPE]).find(trigger => {
    return (
      trigger.worker === 'konnector' &&
      trigger.message &&
      trigger.message.konnector === konnector.slug &&
      trigger.message.account &&
      existingAccountIds.includes(trigger.message.account)
    )
  })
  return trigger
}

export const isTriggerRunning = (state, trigger) => {
  return fromRunning.isTriggerRunning(state.running, trigger)
}
