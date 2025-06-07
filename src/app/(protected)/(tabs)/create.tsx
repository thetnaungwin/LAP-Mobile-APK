import {
  Pressable,
  Text,
  Image,
  View,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { getColorScheme } from "../../../config/color";
import { AntDesign, Feather } from "@expo/vector-icons";
import { ms, s, vs } from "react-native-size-matters";
import { Link, router } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertPost } from "../../../services/postService";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import { setGroup } from "../../../store/slices/groupSlice";
import { useSupabase } from "../../../config/supabase";
import * as ImagePicker from "expo-image-picker";
import { uploadImage } from "../../../services/supabaseImage";

const CreateScreen = () => {
  const { backgroundColor, textColor } = getColorScheme();
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  const [title, setTitle] = useState<string>("");
  const [image, setImage] = useState<string | null>(null);
  const [bodyText, setBodyText] = useState<string>("");
  const group = useSelector((state: RootState) => state.group.group);

  const { mutate, isPending } = useMutation({
    mutationFn: (image: string | undefined) => {
      if (!group) {
        throw new Error("Please select a group");
      }
      if (!title) {
        throw new Error("Title is required");
      }
      return insertPost(
        {
          title,
          description: bodyText,
          group_id: group?.id,
          image,
        },
        supabase
      );
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      goBack();
    },
    onError: (error) => {
      Alert.alert("Failed to insert post", error.message);
    },
  });

  const onPostClick = async () => {
    let imagePath = image ? await uploadImage(image, supabase) : undefined;

    mutate(imagePath);
    setImage(null);
  };

  const goBack = () => {
    setTitle("");
    setBodyText("");
    setImage(null);
    dispatch(setGroup(null));
    router.back();
  };

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  console.log("Rendering in creat post file");

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor, paddingHorizontal: s(15) }}
    >
      <View style={styles.headerContainer}>
        <AntDesign
          name="close"
          size={ms(24)}
          color={textColor}
          onPress={() => goBack()}
        />
        <Pressable
          onPress={() => onPostClick()}
          style={{ marginLeft: "auto" }}
          disabled={isPending}
        >
          <Text style={styles.postText}>
            {isPending ? "Posting..." : "Post"}
          </Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ paddingVertical: vs(12) }}
        >
          <Link href={"GroupSelector"} asChild>
            <Pressable style={styles.communityContainer}>
              {group ? (
                <>
                  <Image
                    // @ts-ignore
                    source={{ uri: group.image }}
                    style={{ width: 20, height: 20, borderRadius: 10 }}
                  />
                  <Text style={{ fontWeight: "600" }}>{group.name}</Text>
                </>
              ) : (
                <>
                  <Text style={styles.rStyles}>r</Text>
                  <Text style={{ fontWeight: "600" }}>Select a community</Text>
                </>
              )}
            </Pressable>
          </Link>

          <TextInput
            placeholder="Title"
            placeholderTextColor={"gray"}
            style={{ ...styles.titleInput, color: textColor }}
            value={title}
            onChangeText={setTitle}
            multiline
            scrollEnabled={false}
          />
          {image && (
            <View style={{ paddingBottom: vs(20) }}>
              <AntDesign
                name="close"
                size={ms(25)}
                color="white"
                onPress={() => setImage(null)}
                style={{
                  position: "absolute",
                  zIndex: 1,
                  right: s(10),
                  top: s(10),
                  padding: s(5),
                  backgroundColor: "#00000090",
                  borderRadius: ms(20),
                }}
              />
              <Image
                source={{ uri: image }}
                style={{ width: "100%", aspectRatio: 1 }}
              />
            </View>
          )}
          <TextInput
            placeholder="body text (optional)"
            placeholderTextColor={"gray"}
            style={{ color: textColor }}
            value={bodyText}
            onChangeText={setBodyText}
            multiline
            scrollEnabled={false}
          />
        </ScrollView>

        {/* FOOTER */}
        <View style={{ flexDirection: "row", gap: s(20), padding: s(10) }}>
          <Feather name="link" size={ms(20)} color={textColor} />
          <Feather
            name="image"
            size={ms(20)}
            color={textColor}
            onPress={pickImage}
          />
          <Feather name="youtube" size={ms(20)} color={textColor} />
          <Feather name="list" size={ms(20)} color={textColor} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CreateScreen;

export const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  postText: {
    fontWeight: "bold",
    paddingVertical: vs(3),
    paddingHorizontal: s(8),
    backgroundColor: "#115BCA",
    color: "#FFF",
    borderRadius: ms(16),
    fontSize: ms(14),
  },
  titleInput: {
    fontSize: ms(20),
    fontWeight: "bold",
    paddingVertical: vs(18),
  },
  rStyles: {
    backgroundColor: "black",
    color: "white",
    paddingVertical: vs(1),
    paddingHorizontal: s(4),
    borderRadius: ms(10),
    fontWeight: "bold",
  },
  communityContainer: {
    backgroundColor: "lightgray",
    flexDirection: "row",
    padding: s(9),
    borderRadius: ms(20),
    gap: 5,
    alignSelf: "flex-start",
    marginVertical: vs(8),
  },
});
