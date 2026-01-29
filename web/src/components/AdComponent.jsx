import { useEffect } from "react";

const AdComponent = ({ slot, style = { display: "block" } }) => {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error("AdSense error:", e);
    }
  }, []);

  return (
    <ins className="adsbygoogle"
         style={style}
         data-ad-client="ca-pub-4295926250176261"
         data-ad-slot={slot}
         data-ad-format="auto"
         data-full-width-responsive="true"></ins>
  );
};

export default AdComponent;
