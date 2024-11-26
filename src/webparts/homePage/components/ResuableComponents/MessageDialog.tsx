import * as React from 'react';
import { mergeStyleSets, DefaultButton, FocusTrapZone, Layer, Overlay, Popup } from '@fluentui/react';
import { Icon } from 'office-ui-fabric-react';
//import { useBoolean } from '@fluentui/react-hooks';

const popupStyles = mergeStyleSets({
    root: {
        background: 'rgba(0, 0, 0, 0.2)',
        bottom: '0',
        left: '0',
        position: 'fixed',
        right: '0',
        top: '0',
        boxSizing: 'border-box'
    },
    content: {
        background: 'white',
        left: '50%',
        maxWidth: '400px',
        padding: '0 2em 2em',
        position: 'absolute',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
    },
    buttonContainer: {
        marginTop: '20px',

    }

});

// Reusable Popup Modal Component
interface IMessageDialogProps {
    isPopupVisible: boolean;
    hidePopup: () => void;
}

const MessageDialog: React.FC<IMessageDialogProps> = ({ isPopupVisible, hidePopup }) => {

    if (!isPopupVisible) {
        return null; // Instead of returning 'false', return 'null' when you don't want to render anything
    }
    //const PopupModal: React.FunctionComponent<PopupModalProps> = ({ isPopupVisible, hidePopup }) => {
    return (
        isPopupVisible && (
            // <Layer>
            //     <Popup style={{ width: '300px', height: '139px', boxSizing: 'border-box' }}
            //         className={popupStyles.root}
            //         role="dialog"
            //         aria-modal="true"
            //         onDismiss={hidePopup}
            //         enableAriaHiddenSiblings={true}
            //     >
            //         <Overlay onClick={hidePopup} />
            //         <FocusTrapZone>
            //             <div role="document" className={popupStyles.content}>
            //                 <h6>Popup</h6>
            //                 <div>
            //                     Data Saved Successfully!!!!!!!!!!
            //                 </div>
            //                 <DefaultButton onClick={hidePopup}>Close</DefaultButton>
            //             </div>
            //         </FocusTrapZone>
            //     </Popup>
            // </Layer>

            <Layer>
                <Popup
                    className={popupStyles.root}
                    role="dialog"
                    aria-modal="true"
                    onDismiss={hidePopup}
                    enableAriaHiddenSiblings={true}
                >
                    <Overlay onClick={hidePopup} />
                    <FocusTrapZone>
                        <div role="document" className={popupStyles.content} style={{ width: '300px', height: '195px' }}>
                            <div>
                                <Icon style={{ color: '#50cd89' }} iconName="AcceptIcon" />
                                <h6>Data Save SuccessFully!!!</h6>
                            </div>

                            <div className={popupStyles.buttonContainer}>
                                <DefaultButton onClick={hidePopup} style={{ background: '#0095e8', top: '30px' }}>OK</DefaultButton>
                            </div>


                        </div>
                    </FocusTrapZone>
                </Popup>
            </Layer>
        )
    );
};

export default MessageDialog;
