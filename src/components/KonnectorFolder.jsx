import React from 'react'
import { Button } from 'cozy-ui/react/Button'
import { translate } from 'cozy-ui/react/I18n'
import Modal, { ModalContent } from 'cozy-ui/react/Modal'
import Spinner from 'cozy-ui/react/Spinner'

import styles from '../styles/konnectorFolder'

import DescriptionContent from './DescriptionContent'
import Field, { DropdownField } from './Field'

class KonnectorFolder extends React.Component {
  componentDidMount = () => {
    const { fields } = this.props
    this.setState({
      fields: fields,
      isModalOpen: false,
      folderUpdateStatus: null
    })
  }

  componentWillReceiveProps = newProps => {
    this.setState({
      fields: newProps.fields
    })
  }

  openModal = event => {
    event.preventDefault()
    this.setState({ isModalOpen: true })
  }

  updateFolderPath = () => {
    const { account, folders } = this.props
    const folderId = this.props.trigger.message.folder_to_save
    const { store } = this.context
    const { fields } = this.state
    this.setState({
      isFetchingUpdateUpdate: true
    })

    const namePath = fields.namePath.value
    const folderPath = fields.folderPath.value
    const fullFolderPath = `${fields.folderPath.value}/${fields.namePath.value}`
    const dirId = folders.find(folder => folder.path === folderPath)._id

    store
      .updateFolderPath(account, folderId, {
        namePath: namePath,
        folderPath: fullFolderPath,
        dir_id: dirId
      })
      .then(() => {
        this.setState({
          isFetchingUpdate: false,
          folderUpdateStatus: 'ok'
        })
      })
      .catch(error => {
        if (error) {
          this.setState({
            isFetchingUpdate: false,
            folderUpdateStatus: 'error'
          })
        }
      })
  }

  closeModal = () => {
    this.setState({ isModalOpen: false, folderUpdateStatus: null })
  }

  render(
    { t, account, driveUrl, connector, trigger, closeModal, isFetching },
    { fields, isModalOpen, isFetchingUpdate, changeState, folderUpdateStatus }
  ) {
    return (
      <div className={styles['col-account-folder']}>
        {account &&
          account.auth && (
            <DescriptionContent title={t('account.folder.title')}>
              <div
                style={{ display: isFetching ? 'block' : 'none' }}
                className={styles['col-account-folder-fetching']}
              >
                <Spinner size="xxlarge" middle="true" />
              </div>
              {driveUrl && (
                <a
                  className={styles['col-account-folder-link']}
                  href={`${driveUrl}${trigger.message.folder_to_save}`}
                >
                  {t('account.folder.link')}
                </a>
              )}
              {!!fields && (
                <form onSubmit={this.openModal}>
                  <Field
                    label={t('account.form.label.namePath')}
                    {...fields.namePath}
                  />
                  <DropdownField
                    label={t('account.form.label.folderPath')}
                    {...fields.folderPath}
                  />
                  <Button
                    theme="secondary"
                    className={styles['col-account-folder-save-btn']}
                  >
                    {t('account.form.button.save')}
                  </Button>
                </form>
              )}

              {isModalOpen && (
                <Modal
                  secondaryAction={() => closeModal()}
                  title={t('account.folder.warning')}
                  className={styles['col-account-folder-modal-path']}
                >
                  <ModalContent>
                    <p>{t('account.folder.oldFiles')}</p>
                    <p>{t('account.folder.newFiles')}</p>
                    {!isFetchingUpdate &&
                      folderUpdateStatus === 'ok' && (
                        <div>
                          <p>
                            <b>
                              {t('account.folder.newPath', {
                                name: connector.name
                              })}
                            </b>
                          </p>
                          <p>
                            <span
                              className={
                                styles['col-account-folder-highlighted-data']
                              }
                            >
                              {`${fields.folderPath.value}/${
                                fields.namePath.value
                              }`}
                            </span>
                          </p>
                        </div>
                      )}

                    {!isFetchingUpdate &&
                      folderUpdateStatus === 'error' && (
                        <p>{t('account.folder.error')}</p>
                      )}

                    <p className={styles['col-account-folder-modal-path-btn']}>
                      {folderUpdateStatus ? (
                        <Button theme="secondary" onClick={() => closeModal()}>
                          {t('account.folder.close')}
                        </Button>
                      ) : (
                        <Button
                          busy={isFetchingUpdate}
                          theme="regular"
                          onClick={this.updateFolderPath}
                        >
                          {t('account.folder.changePath')}
                        </Button>
                      )}
                    </p>
                  </ModalContent>
                </Modal>
              )}
            </DescriptionContent>
          )}
      </div>
    )
  }
}

export default translate()(KonnectorFolder)
