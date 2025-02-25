import { Alert, Pressable, Text, View } from "react-native";

export default function Index() {
  const handlePress = async () => {
    console.log("Sending request...");
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const response = await fetch("https://macbookair.tail05fcc.ts.net/", {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const text = await response.text();
      Alert.alert(text);
    } catch (error) {
      Alert.alert("Error", error.message);
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
