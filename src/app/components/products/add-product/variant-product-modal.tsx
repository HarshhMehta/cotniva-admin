import { useState } from "react";
import ImageUpload from "../../common/image-upload";
import { Variant } from "@/types/product-type";

interface VariantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (variant: Variant) => void;
  editData?: Variant | null;
}

/** Gallery image modal — image + default only (no color) */
export default function VariantModal({ isOpen, onClose, onSave, editData = null }: VariantModalProps) {
  const [thumbnail, setThumbnail] = useState(editData?.img ? [editData.img] : null);
  const [isDefault, setIsDefault] = useState(editData?.isDefault || false);

  const handleSave = () => {
    if (!thumbnail) {
      alert("Please select a gallery image");
      return;
    }

    onSave({
      img: thumbnail[0],
      color: "",
      size: "",
      isDefault,
    });

    setThumbnail(null);
    setIsDefault(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-red p-3"
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold mb-4 text-gray-800">Gallery Image</h2>

        <div className="space-y-4">
          <div>
            <label className="block font-medium text-gray-600 mb-2">
              Select Image (Recommended: 570x510)
            </label>
            <ImageUpload
              images={thumbnail}
              setImages={setThumbnail}
              multiple={false}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isDefault"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray2 rounded focus:ring-blue-500"
            />
            <label htmlFor="isDefault" className="text-gray-700">
              Set as default / main image
            </label>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="mt-6 w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Save Image
        </button>
      </div>
    </div>
  );
}
