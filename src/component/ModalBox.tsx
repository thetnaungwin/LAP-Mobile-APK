import { View, Text, Modal, Pressable } from "react-native";
import React from "react";
import { styles } from "../app/(protected)/(tabs)/create";
import { getColorScheme } from "../config/color";

interface Props {
  showDiscardModal: boolean;
  handleDiscard: () => void;
  handleCancel: () => void;
  title: string;
  BodyText: string;
  btnActionText: string;
  btnCancelText: string;
}

const ModalBox = ({
  showDiscardModal,
  handleDiscard,
  handleCancel,
  title,
  BodyText,
  btnActionText,
  btnCancelText,
}: Props) => {
  const { modalBg, textColor } = getColorScheme();
  return (
    <Modal
      visible={showDiscardModal}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={[{ ...styles.modalContent, backgroundColor: modalBg }]}>
          <Text style={[{ ...styles.modalTitle, color: textColor }]}>
            {title}
          </Text>
          <Text style={styles.modalMessage}>{BodyText}</Text>
          <View style={styles.modalButtonRow}>
            <Pressable
              style={[styles.modalButton, { backgroundColor: "#115BCA" }]}
              onPress={handleDiscard}
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>
                {btnActionText}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.modalButton, { backgroundColor: "#eee" }]}
              onPress={handleCancel}
            >
              <Text style={{ color: "#115BCA", fontWeight: "bold" }}>
                {btnCancelText}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ModalBox;
