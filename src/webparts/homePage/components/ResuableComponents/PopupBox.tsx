import * as React from 'react';
// import { mergeStyleSets, DefaultButton, FocusTrapZone, Layer, Overlay, Popup } from '@fluentui/react';
import { Icon } from 'office-ui-fabric-react';
//import { useBoolean } from '@fluentui/react-hooks';
import {
    Dialog,
    DialogType,
    DialogFooter,
    PrimaryButton,
    DefaultButton,
    Layer,

} from "@fluentui/react";
import './PopupStyle.css';

// const PopupBoxStyles = mergeStyleSets({
//     root: {
//         background: 'rgba(0, 0, 0, 0.2)',
//         bottom: '0',
//         left: '0',
//         position: 'fixed',
//         right: '0',
//         top: '0',
//         boxSizing: 'border-box',
//         zIndex: 6000
//     },
//     content: {
//         background: 'white',
//         left: '50%',
//         maxWidth: '400px',
//         padding: '0 2em 2em',
//         position: 'absolute',
//         top: '50%',
//         transform: 'translate(-50%, -50%)',
//         display: 'flex',
//         flexDirection: 'column',
//         alignItems: 'center',
//         justifyContent: 'center',
//         textAlign: 'center',
//     },
//     buttonContainer: {
//         marginTop: '-5px',

//     }

// });

// Reusable Popup Modal Component
interface IPopupboxProps {
    isPopupBoxVisible: boolean;
    hidePopup: () => void;
}

const PopupBox: React.FC<IPopupboxProps> = ({ isPopupBoxVisible, hidePopup }) => {
    console.log("Alert Box");
    if (!isPopupBoxVisible) {
        return null; // Instead of returning 'false', return 'null' when you don't want to render anything
    }
    //const PopupModal: React.FunctionComponent<PopupModalProps> = ({ isPopupBoxVisible, hidePopup }) => {

    return (
        // isPopupBoxVisible && (
        //     <Layer>
        //         <Popup
        //             className={PopupBoxStyles.root}
        //             role="dialog"
        //             aria-modal="true"
        //             onDismiss={hidePopup}
        //             enableAriaHiddenSiblings={true}
        //         >
        //             <Overlay onClick={hidePopup} />
        //             <FocusTrapZone>
        //                 <div role="document" className={PopupBoxStyles.content} style={{ width: '300px', height: '235px', borderRadius: 5 }}>
        //                     <div>
        //                         <Icon style={{ color: '#50cd89', fontSize: 80 }} iconName="Completed" />

        //                     </div>
        //                     <div>
        //                         <h6>Data Saved Successfully.</h6>
        //                     </div>
        //                     <div className={PopupBoxStyles.buttonContainer}>
        //                         <DefaultButton onClick={hidePopup} style={{ background: '#0095e8', top: '30px', border: 0, color: 'white' }}>OK</DefaultButton>
        //                     </div>


        //                 </div>
        //             </FocusTrapZone>
        //         </Popup>
        //     </Layer>
        // )
        <>{isPopupBoxVisible ?
            <Layer>
                <div className="backdrop"></div>
                <div className="alert">
                    <div className="alert-content">
                        <div className="alert-icon">
                            <Icon style={{ color: '#50cd89', fontSize: 80 }} iconName="Completed" />
                        </div>
                        <p className="alert-message">Data Saved Successfully.</p>
                        <button className="alert-button" onClick={hidePopup}>OK</button>
                    </div>
                </div>
            </Layer>
            : <></>
        }
        </>


    );
};

export default React.memo(PopupBox);




interface IConfirmboxProps {
    hideDialog: boolean;
    closeDialog: () => void;
    handleConfirm: (value: boolean) => void;
    msg: string;
}
export const ConfirmationDialog: React.FC<IConfirmboxProps> = ({ hideDialog, closeDialog, handleConfirm, msg }) => {

    return (
        <div>
            <Dialog
                hidden={!hideDialog}
                onDismiss={closeDialog}
                dialogContentProps={{
                    type: DialogType.normal,
                    title: "Confirm Action",
                    subText: msg,
                }}
                modalProps={{
                    isBlocking: true,
                }}
            >
                <DialogFooter>
                    <PrimaryButton text="Yes" onClick={() => handleConfirm(true)} />
                    <DefaultButton text="No" onClick={closeDialog} />
                </DialogFooter>
            </Dialog>
        </div>
    );
};



// <Layer>
//     <Popup style={{ width: '300px', height: '139px', boxSizing: 'border-box' }}
//         className={PopupBoxStyles.root}
//         role="dialog"
//         aria-modal="true"
//         onDismiss={hidePopup}
//         enableAriaHiddenSiblings={true}
//     >
//         <Overlay onClick={hidePopup} />
//         <FocusTrapZone>
//             <div role="document" className={PopupBoxStyles.content}>
//                 <h6>Popup</h6>
//                 <div>
//                     Data Saved Successfully!!!!!!!!!!
//                 </div>
//                 <DefaultButton onClick={hidePopup}>Close</DefaultButton>
//             </div>
//         </FocusTrapZone>
//     </Popup>
// </Layer>