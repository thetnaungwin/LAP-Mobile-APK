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
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { getColorScheme } from "../../../config/color";
import { AntDesign, Feather } from "@expo/vector-icons";
import { ms, s, vs } from "react-native-size-matters";
import { Link, router, useLocalSearchParams } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertPost, updatePost } from "../../../services/postService";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import { setGroup } from "../../../store/slices/groupSlice";
import { useSupabase } from "../../../config/supabase";
import * as ImagePicker from "expo-image-picker";
import { uploadImage } from "../../../services/supabaseImage";
import ModalBox from "../../../component/ModalBox";
import SupabaseImage from "../../../component/SupabaseImage";

const CreateScreen = () => {
  const { backgroundColor, textColor } = getColorScheme();
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  const [title, setTitle] = useState<string>("");
  const [image, setImage] = useState<string | null>(null);
  const [bodyText, setBodyText] = useState<string>("");
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const group = useSelector((state: RootState) => state.group.group);
  const { data }: any = useLocalSearchParams();
  const parsedData = data ? JSON.parse(data) : [];

  useEffect(() => {
    if (parsedData && Object.keys(parsedData).length > 0) {
      setTitle(parsedData.title || "");
      setBodyText(parsedData.description || "");
      setImage(parsedData.image || null);
      dispatch(setGroup(parsedData.group || null));
    }
  }, []);

  const { mutate, isPending } = useMutation({
    mutationFn: async (image: string | null | undefined) => {
      const payload = {
        title,
        description: bodyText,
        group_id: group?.id,
        image, // null will remove image
      };

      if (!parsedData || parsedData.length === 0) {
        // @ts-ignore
        return await insertPost(payload, supabase);
      } else {
        return await updatePost(parsedData.id, payload, supabase);
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      if (!parsedData || parsedData.length === 0) {
        goBack();
      } else {
        router.replace(`/post/${parsedData.id}`);
        dispatch(setGroup(null));
      }
    },
    onError: (error) => {
      Alert.alert("Failed to save post", error.message);
    },
  });

  const onPostClick = async () => {
    try {
      let imagePath: string | null | undefined;

      if (image && image.startsWith("file://")) {
        // New image picked
        imagePath = await uploadImage(image, supabase);
      } else if (image === null) {
        // Image removed by user
        imagePath = null;
      } else {
        // Keep existing image
        imagePath = parsedData?.image || null;
      }

      mutate(imagePath); // call your existing mutation
    } catch (err: any) {
      console.log("Save failed:", err.message);
    }
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

  const handleClosePress = () => {
    if (!parsedData || parsedData.length === 0) {
      if (title || bodyText || group || image) {
        setShowDiscardModal(true);
      } else {
        goBack();
      }
    } else {
      router.replace(`/post/${parsedData.id}`);
      dispatch(setGroup(null));
    }
  };

  const handleDiscard = () => {
    setShowDiscardModal(false);
    goBack();
  };

  const handleCancel = () => {
    setShowDiscardModal(false);
  };

  console.log("Rendering in creat post file");

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor, paddingHorizontal: s(15) }}
    >
      <ModalBox
        showDiscardModal={showDiscardModal}
        handleDiscard={handleDiscard}
        handleCancel={handleCancel}
        title="Discard post?"
        BodyText="If you go back now, your post will be lost."
        btnActionText="Discard"
        btnCancelText="Cancel"
      />

      <View style={styles.headerContainer}>
        <AntDesign
          name="close"
          size={ms(26)}
          color={textColor}
          onPress={handleClosePress}
        />
        <Pressable
          onPress={() => onPostClick()}
          style={{ marginLeft: "auto" }}
          disabled={isPending}
        >
          <Text style={styles.postText}>
            {!parsedData || parsedData.length === 0
              ? isPending
                ? "Posting..."
                : "Post"
              : "Update"}
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
                    style={{ width: s(20), height: vs(20), borderRadius: 10 }}
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

              {image.startsWith("file://") ? (
                // Local image from ImagePicker
                <Image
                  source={{ uri: image }}
                  style={{ width: "100%", aspectRatio: 1 }}
                />
              ) : (
                // Supabase image from DB
                <SupabaseImage
                  path={image}
                  bucket="image"
                  style={{
                    width: "100%",
                    aspectRatio: 4 / 3,
                    borderRadius: ms(15),
                  }}
                />
              )}
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
    fontSize: ms(16),
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    borderRadius: s(16),
    padding: s(24),
    width: "80%",
    alignItems: "center",
    elevation: 5,
  },
  modalTitle: {
    fontSize: ms(20),
    fontWeight: "bold",
    marginBottom: vs(8),
  },
  modalMessage: {
    fontSize: ms(16),
    color: "#555",
    marginBottom: vs(24),
    textAlign: "center",
  },
  modalButtonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: s(12),
  },
  modalButton: {
    flex: 1,
    paddingVertical: vs(12),
    borderRadius: s(8),
    alignItems: "center",
  },
});
