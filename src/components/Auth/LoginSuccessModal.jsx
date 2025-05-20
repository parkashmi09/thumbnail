import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import './AuthModals.css';

const LoginSuccessModal = ({ isOpen, onClose, userName }) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="auth-modal" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="modal-overlay" />
        </Transition.Child>

        <div className="modal-container">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel
              as={motion.div}
              className="success-modal-panel"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.35, type: 'spring', bounce: 0.2 }}
            >
              <motion.div 
                className="success-icon-container"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  delay: 0.2, 
                  duration: 0.5, 
                  type: 'spring', 
                  bounce: 0.35 
                }}
              >
                <CheckCircle size={70} className="success-icon" strokeWidth={1.5} />
              </motion.div>
              
              <motion.div
                className="success-content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
              >
                <Dialog.Title className="success-title">
                  Login Successful!
                </Dialog.Title>
                
                <div className="success-message">
                  {userName ? (
                    <span>Welcome back, <b>{userName}</b>!</span>
                  ) : (
                    <span>You have successfully logged in.</span>
                  )}
                </div>
                
                <motion.button
                  className="success-button"
                  onClick={onClose}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.3 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Continue
                </motion.button>
              </motion.div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export default LoginSuccessModal; 