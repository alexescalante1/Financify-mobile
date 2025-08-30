import React, { useState } from "react";
import { View, ScrollView } from "react-native";
import {
  Text,
  Button,
  Card,
  Divider,
  Avatar,
  useTheme,
} from "react-native-paper";

import { DialogName } from "./types";
import { SmoothPopupFullScreen } from "@/presentation/components/widgets/screen/SmoothPopupFullScreen";

import { FinancifyButton } from "@/presentation/components/widgets/button/FinancifyButton";

// Widgets
import { ButtonExamples } from "@/presentation/components/widgets/button/ButtonExamples";
import { CardExamples } from "@/presentation/components/widgets/card/CardExamples";
import { DialogExamples } from "@/presentation/components/widgets/dialog/DialogExamples";

export const WidgetsScreen: React.FC = () => {
  // DIALOG MANAGEMENT
  const [dialogState, setDialogState] = useState<Record<DialogName, boolean>>({
    button: false,
    card: false,
    dialog: false
  });

  const openDialog = (dialogName: DialogName) => {
    setDialogState((prevState) => ({
      ...prevState,
      [dialogName]: true,
    }));
  };

  const closeDialog = (dialogName: DialogName) => {
    setDialogState((prevState) => ({
      ...prevState,
      [dialogName]: false,
    }));
  };

  const getOpenDialog = (): DialogName | null => {
    const openEntry = Object.entries(dialogState).find(
      ([_, isOpen]) => isOpen === true
    );
    return openEntry ? (openEntry[0] as DialogName) : null;
  };

  return (
    <ScrollView>
      <View style={{ gap: 12 }}>
        <FinancifyButton
          title="Buttons"
          variant="primary"
          icon="bank-transfer"
          style={{ flex: 1 }}
          onPress={() => openDialog("button")}
        />

        <FinancifyButton
          title="Cards"
          variant="danger"
          icon="bank-transfer"
          style={{ flex: 1 }}
          onPress={() => openDialog("card")}
        />

        <FinancifyButton
          title="Dialogs"
          variant="danger"
          icon="bank-transfer"
          style={{ flex: 1 }}
          onPress={() => openDialog("dialog")}
        />
        
      </View>

      {/* Modals de preview */}
      {dialogState.button && (
        <SmoothPopupFullScreen
          visible={dialogState.button}
          onDismiss={() => closeDialog("button")}
          // backgroundColor={theme.colors.surface}
          title="BOTONES EXAMPLE"
        >
          <ScrollView>
            <ButtonExamples />
          </ScrollView>
        </SmoothPopupFullScreen>
      )}

      {dialogState.card && (
        <SmoothPopupFullScreen
          visible={dialogState.card}
          onDismiss={() => closeDialog("card")}
          // backgroundColor={theme.colors.surface}
          title="CARD EXAMPLE"
        >
          <ScrollView>
            <CardExamples />
          </ScrollView>
        </SmoothPopupFullScreen>
      )}

      {dialogState.dialog && (
        <SmoothPopupFullScreen
          visible={dialogState.dialog}
          onDismiss={() => closeDialog("dialog")}
          // backgroundColor={theme.colors.surface}
          title="DIALOG EXAMPLE"
        >
          <ScrollView>
            <DialogExamples />
          </ScrollView>
        </SmoothPopupFullScreen>
      )}

    </ScrollView>
  );
};
