import { ComponentProps, useEffect, useState } from "react";
import { ActivityIndicator, Image, View } from "react-native";
import { useSupabase } from "../config/supabase";
import { downloadImage } from "../services/supabaseImage";

type SupabaseImageProps = {
  bucket: string;
  path: string;
} & ComponentProps<typeof Image>;

export default function SupabaseImage({
  path,
  bucket,
  ...imageProps
}: SupabaseImageProps) {
  const [image, setImage] = useState<string | any>();
  const [isLoading, setIsLoading] = useState(true);

  const supabase = useSupabase();

  const handleDownload = async () => {
    const result = await downloadImage(path, supabase);
    setImage(result);
    setIsLoading(false);
  };

  useEffect(() => {
    setIsLoading(true);
    if (path && bucket) {
      handleDownload();
    } else {
      setIsLoading(false);
    }
  }, [path, bucket]);

  if (isLoading) {
    return (
      <View
        style={[
          {
            backgroundColor: "gainsboro",
            alignItems: "center",
            justifyContent: "center",
          },
          imageProps.style,
        ]}
      >
        <ActivityIndicator />
      </View>
    );
  }

  return <Image source={{ uri: image }} {...imageProps} />;
}
