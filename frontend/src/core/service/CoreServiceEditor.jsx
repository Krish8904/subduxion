import React from "react";

const CoreServiceEditor = ({
  id,
  formData,
  setFormData,
  handleSave,
  onCancel,
}) => {
  // 🔒 Global safety check
  if (!formData) {
    return (
      <div className="p-10 text-gray-400 font-bold">
        Loading editor...
      </div>
    );
  }

  // =========================
  // HERO EDITOR
  // =========================
  if (id === "hero") {
    return (
      <div className="p-12 font-poppins bg-white min-h-screen text-left">
        <h2 className="text-3xl font-bold mb-8">Edit Hero Section</h2>

        <div className="space-y-6 max-w-3xl">
          <div>
            <label className="block text-sm font-bold mb-2">Main Text</label>
            <textarea
              className="w-full p-4 border rounded-lg"
              rows="3"
              value={formData?.mainText || ""}
              onChange={(e) =>
                setFormData({ ...formData, mainText: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">
              Secondary Text
            </label>
            <textarea
              className="w-full p-4 border rounded-lg"
              rows="4"
              value={formData?.secondaryText || ""}
              onChange={(e) =>
                setFormData({ ...formData, secondaryText: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Button Text</label>
            <input
              className="w-full p-3 border rounded-lg"
              value={formData?.buttonText || ""}
              onChange={(e) =>
                setFormData({ ...formData, buttonText: e.target.value })
              }
            />
          </div>
        </div>

        <div className="mt-10 flex gap-4">
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold"
          >
            Save Changes
          </button>

          <button
            onClick={onCancel}
            className="bg-gray-200 px-8 py-3 rounded-lg font-bold"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // =========================
  // SERVICES EDITOR
  // =========================
  if (id === "services") {
    // 🔒 Ensure array before using map
    if (!Array.isArray(formData)) {
      return (
        <div className="p-10 text-red-500 font-bold">
          Services data is not an array.
        </div>
      );
    }

    return (
      <div className="p-12 font-poppins bg-white min-h-screen text-left">
        <h2 className="text-3xl font-bold mb-8">Edit Services Cards</h2>

        <div className="space-y-8 max-w-4xl">
          {formData.map((card, index) => (
            <div
              key={index}
              className="border rounded-xl p-6 shadow-sm bg-gray-50 space-y-4"
            >
              <div>
                <label className="block text-sm font-bold mb-2">Title</label>
                <input
                  className="w-full p-3 border rounded-lg"
                  value={card?.title || ""}
                  onChange={(e) => {
                    const updated = [...formData];
                    updated[index].title = e.target.value;
                    setFormData(updated);
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">
                  Description
                </label>
                <textarea
                  rows="3"
                  className="w-full p-3 border rounded-lg"
                  value={card?.desc || ""}
                  onChange={(e) => {
                    const updated = [...formData];
                    updated[index].desc = e.target.value;
                    setFormData(updated);
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">
                  Border Color Class
                </label>
                <input
                  className="w-full p-3 border rounded-lg"
                  value={card?.color || ""}
                  onChange={(e) => {
                    const updated = [...formData];
                    updated[index].color = e.target.value;
                    setFormData(updated);
                  }}
                />
              </div>

              <button
                onClick={() => {
                  const updated = formData.filter((_, i) => i !== index);
                  setFormData(updated);
                }}
                className="text-red-600 text-sm font-bold"
              >
                Delete Card
              </button>
            </div>
          ))}

          <button
            onClick={() =>
              setFormData([
                ...formData,
                { title: "New Service", desc: "", color: "border-blue-600" },
              ])
            }
            className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold"
          >
            Add New Service
          </button>
        </div>

        <div className="mt-10 flex gap-4">
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold"
          >
            Save Changes
          </button>

          <button
            onClick={onCancel}
            className="bg-gray-200 px-8 py-3 rounded-lg font-bold"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // =========================
  // CTA EDITOR
  // =========================
  if (id === "cta") {
    return (
      <div className="p-12 font-poppins bg-white min-h-screen text-left">
        <h2 className="text-3xl font-bold mb-8">Edit CTA Section</h2>

        <div className="space-y-6 max-w-3xl">
          <div>
            <label className="block text-sm font-bold mb-2">Title</label>
            <input
              className="w-full p-3 border rounded-lg"
              value={formData?.title || ""}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Text</label>
            <textarea
              rows="3"
              className="w-full p-3 border rounded-lg"
              value={formData?.text || ""}
              onChange={(e) =>
                setFormData({ ...formData, text: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Button Text</label>
            <input
              className="w-full p-3 border rounded-lg"
              value={formData?.buttonText || ""}
              onChange={(e) =>
                setFormData({ ...formData, buttonText: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Button Link</label>
            <input
              className="w-full p-3 border rounded-lg"
              value={formData?.link || ""}
              onChange={(e) =>
                setFormData({ ...formData, link: e.target.value })
              }
            />
          </div>
        </div>

        <div className="mt-10 flex gap-4">
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold"
          >
            Save Changes
          </button>

          <button
            onClick={onCancel}
            className="bg-gray-200 px-8 py-3 rounded-lg font-bold"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-10 text-gray-400 font-bold">
      Unknown section type.
    </div>
  );
};

export default CoreServiceEditor;