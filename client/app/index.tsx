import { Alert, Pressable, Text, TextInput, View } from "react-native";
import { useState } from "react";

export default function Index() {
  const [serverURL, setServerURL] = useState<string>("http://localhost:3000");

  const handlePress = async () => {
    console.log("Sending request...");
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const asURL = new URL(serverURL);

      const response = await fetch(asURL, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const text = await response.text();
      Alert.alert(text);
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    }
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <TextInput
        value={serverURL}
        onChangeText={(text) => {
          setServerURL(text);
        }}
        style={{
          borderWidth: 1,
          padding: 8,
          width: "80%",
          marginBottom: 10,
        }}
        placeholder="Enter server URL"
      />
      <Pressable
        onPress={handlePress}
        style={{
          backgroundColor: "red",
          padding: 10,
        }}
      >
        <Text
          style={{
            color: "white",
            fontWeight: "bold",
          }}
        >
          Fetch
        </Text>
      </Pressable>
    </View>
  );
}
