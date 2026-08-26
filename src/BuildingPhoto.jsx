import React, { useState, useEffect } from "react";
import BuildingArt from "./buildingArt.jsx";
function BuildingPhoto({ url, seed, alt }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    setFailed(false);
  }, [url]);
  if (url && !failed) {
    return <img className="tf-photo-img" src={url} alt={alt || ""} loading="lazy" onError={() => setFailed(true)} />;
  }
  return <BuildingArt seed={seed} />;
}
export {
  BuildingPhoto as default
};
