import { useEffect, useState } from "react";
import ImageUpload from "../../common/image-upload";
import { Variant } from "@/types/product-type";

interface VariantModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Called with one or more gallery variants (multi-select when adding) */
  onSave: (variants: Variant[]) => void;
  editData?: Variant | null;
}

/** Gallery image modal — image(s), colour (for shop filter), default + hover flags */
export default function VariantModal({
  isOpen,
  onClose,
  onSave,
  editData = null,
}: VariantModalProps) {
  const isEditing = Boolean(editData?.img);
  const [thumbnail, setThumbnail] = useState<(File | string)[] | null>(
    editData?.img ? [editData.img] : null
  );
  const [isDefault, setIsDefault] = useState(editData?.isDefault || false);
  const [isHover, setIsHover] = useState(editData?.isHover || false);
  const [colorName, setColorName] = useState(editData?.color || "");
  const [colorCode, setColorCode] = useState(editData?.colorCode || "#4a1f1a");

  useEffect(() => {
    if (!isOpen) return;
    setThumbnail(editData?.img ? [editData.img] : null);
    setIsDefault(editData?.isDefault || false);
    setIsHover(editData?.isHover || false);
    setColorName(editData?.color || "");
    setColorCode(editData?.colorCode || "#4a1f1a");
  }, [isOpen, editData]);

  const handleSave = () => {
    const files = (thumbnail || []).filter(Boolean);
    if (!files.length) {
      alert("Please select at least one gallery image");
      return;
    }

    const color = colorName.trim();
    const variants: Variant[] = files.map((img, index) => ({
      img,
      color,
      colorCode: color ? colorCode : "",
      size: "",
      // Only first image of a multi-batch can be marked default / hover
      isDefault: isDefault && index === 0,
      isHover: isHover && index === 0,
    }));

    onSave(variants);

    setThumbnail(null);
    setIsDefault(false);
    setIsHover(false);
    setColorName("");
    setColorCode("#4a1f1a");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-xl relative max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-red p-3"
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          {isEditing ? "Gallery Image" : "Gallery Images"}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block font-medium text-gray-600 mb-2">
              {isEditing
                ? "Select Image (Recommended: 570x510)"
                : "Select Images — you can pick many at once (Recommended: 570x510)"}
            </label>
            <ImageUpload
              images={thumbnail}
              setImages={setThumbnail}
              multiple={!isEditing}
            />
            {!isEditing ? (
              <p className="text-xs text-gray-500 mt-2">
                Hold Ctrl/Cmd (or Shift) to select multiple files in the file
                picker.
              </p>
            ) : null}
          </div>

          <div>
            <label className="block font-medium text-gray-600 mb-2">
              Colour{" "}
              <span className="text-gray-400 font-normal">(for shop filter)</span>
            </label>
            <p className="text-sm text-gray-500 mb-2">
              Optional — applied to all images selected in this batch.
            </p>
            <div className="flex gap-3 items-center">
              <input
                type="text"
                value={colorName}
                onChange={(e) => setColorName(e.target.value)}
                placeholder="e.g. Maroon, Ivory, Black"
                className="flex-1 px-4 py-2.5 border border-gray2 rounded-lg focus:outline-none focus:border-theme"
              />
              <input
                type="color"
                value={colorCode || "#4a1f1a"}
                onChange={(e) => setColorCode(e.target.value)}
                className="w-12 h-11 rounded cursor-pointer border border-gray2"
                title="Colour swatch"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isDefault"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="w-4 h-4 text-theme border-gray2 rounded focus:ring-theme"
            />
            <label htmlFor="isDefault" className="text-gray-700">
              {isEditing
                ? "Set as default / main image"
                : "Set first selected image as default / main"}
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isHover"
              checked={isHover}
              onChange={(e) => setIsHover(e.target.checked)}
              className="w-4 h-4 text-theme border-gray2 rounded focus:ring-theme"
            />
            <label htmlFor="isHover" className="text-gray-700">
              {isEditing
                ? "Set as hover image (product card hover)"
                : "Set first selected image as hover image"}
            </label>
          </div>
          <p className="text-xs text-gray-500 -mt-2 ml-6">
            If no hover image is set, the storefront uses the second gallery
            image by default.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="mt-6 w-full bg-theme text-white py-2.5 rounded-lg hover:bg-themeDark transition-colors font-medium"
        >
          {isEditing
            ? "Save Image"
            : (thumbnail || []).length > 1
              ? `Save ${(thumbnail || []).length} Images`
              : "Save Image"}
        </button>
      </div>
    </div>
  );
}
