import React, { useState, useEffect } from "react";
import axios from "axios";

const AdminPanel = () => {
  const [properties, setProperties] = useState([]);
  const [users, setUsers] = useState([]);
  const [activityStatus, setActivityStatus] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [editingPropertyId, setEditingPropertyId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    tags: [],
    images: [],
    features: {
      interior: [],
      exterior: [],
      basement: "Finished",
    },
    generalInfo: {
      propertyAddress: "",
      propertyType: [],
      yearBuilt: "",
      squareFootage: "",
      numberOfBedrooms: "",
      numberOfBathrooms: "",
      numberOfFloors: "",
    },
    location: "",
    mapUrl: "",
    radius: "", // ✅ Added radius
  });

  // 1. Define the base URL at the top of your component or in a config file
const BASE_URL = import.meta.env.MODE === 'production' 
  ? 'https://prehome-prospect-dashboard-6cya.onrender.com' 
  : 'http://localhost:5000';

  const API_BASE =`${BASE_URL}/api`;
  const UPLOADS_BASE = "http://localhost:5000";

  useEffect(() => {
    fetchProperties();
    fetchUsers();
    fetchUserActivities();
  }, []);

  const fetchProperties = async () => {
    try {
      const res = await axios.get(`${API_BASE}/properties`);
      setProperties(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching properties:", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/admin/users`);
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const fetchUserActivities = async () => {
    try {
      const res = await axios.get(`${API_BASE}/admin/all-activities`);
      const map = {};
      res.data.forEach(({ userId, propertyId, status }) => {
        if (!map[userId]) map[userId] = {};
        map[userId][propertyId] = status || "";
      });
      setActivityStatus(map);
    } catch (err) {
      console.error("Error fetching activities:", err);
    }
  };

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      tags: [],
      images: [{ url: "", label: "" }],
      features: {
        interior: [],
        exterior: [],
        basement: "Finished",
      },
      generalInfo: {
        propertyAddress: "",
        propertyType: [],
        yearBuilt: "",
        squareFootage: "",
        numberOfBedrooms: "",
        numberOfBathrooms: "",
        numberOfFloors: "",
      },
      location: "",
      mapUrl: "",
      radius: 1000,
    });
    setEditMode(false);
    setEditingPropertyId(null);
  };

  const handleAddOrUpdateProperty = async () => {
    try {
      if (editMode) {
        await axios.put(`${API_BASE}/admin/property/${editingPropertyId}`, form);
      } else {
        await axios.post(`${API_BASE}/admin/property`, form);
      }
      fetchProperties();
      resetForm();
      setShowModal(false);
    } catch (err) {
      console.error("Failed to submit property:", err);
    }
  };

  const handleEditProperty = (property) => {
    setForm({
      ...property,
      radius: property.radius || 1000, // Default if missing
    });
    setEditMode(true);
    setEditingPropertyId(property._id);
    setShowModal(true);
  };

  const handleDeleteProperty = async (id) => {
    if (window.confirm("Delete this property?")) {
      await axios.delete(`${API_BASE}/admin/property/${id}`);
      fetchProperties();
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm("Remove this user?")) {
      await axios.delete(`${API_BASE}/admin/user/${id}`);
      fetchUsers();
    }
  };

  const handleToggleBlockUser = async (id) => {
    await axios.patch(`${API_BASE}/admin/user/block/${id}`);
    fetchUsers();
  };

  const handleStatusChange = (userId, propertyId, newStatus) => {
    setActivityStatus((prev) => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [propertyId]: newStatus,
      },
    }));
  };

  const saveStatus = async (userId, propertyId) => {
    const status = activityStatus[userId]?.[propertyId];
    try {
      await axios.patch(`${API_BASE}/activity/status`, { userId, propertyId, status });
      alert("Status updated!");
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };
const deleteStatus = async (userId, propertyId) => {
  if (!window.confirm("Are you sure you want to delete this status?")) return;

  try {
    await axios.delete(`${API_BASE}/activity/${userId}/${propertyId}`);
    alert("Status deleted!");

    setActivityStatus((prev) => {
      const updated = { ...prev };
      if (updated[userId]) {
        delete updated[userId][propertyId];
      }
      return updated;
    });
  } catch (err) {
    console.error("Failed to delete status:", err);
    alert("Error deleting status");
  }
};
const handleUpload = async (e) => {
  const formData = new FormData();
  formData.append("image", e.target.files[0]);

  try {
    const res = await axios.post("http://localhost:5000/api/admin/upload-image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    const newImage = {
      url: res.data.imageUrl, // returned from server
      label: "", // or you can prompt the user for label
    };
    setForm((prev) => ({
      ...prev,
      images: [...prev.images, newImage],
    }));
  } catch (err) {
    console.error("Upload error:", err);
  }
};


  return (
    <div style={{ padding: 20, fontFamily: "Poppins, sans-serif" }}>
      <h2>Admin Panel</h2>

      <button onClick={() => setShowModal(true)}>+ Add New Property</button>

      {showModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)", display: "flex",
          justifyContent: "center", alignItems: "center", zIndex: 1000
        }}>
          <div style={{ backgroundColor: "white", padding: 20, maxHeight: "90vh", overflowY: "auto", width: "90%", maxWidth: 800 }}>
            <h3>{editMode ? "Edit Property" : "Add Property"}</h3>

            <input placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            <input placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            <input placeholder="Tags (comma-separated)" value={form.tags.join(",")} onChange={e => setForm({ ...form, tags: e.target.value.split(",").map(tag => tag.trim()) })} />
<h4>Images</h4>
{form.images.map((img, idx) => (
  <div key={idx}>
    {img.url && (
      <img
       src={img.url.startsWith("http") ? img.url : `${UPLOADS_BASE}${img.url}`}
        alt={img.label || "Image"}
        style={{ width: "100px", height: "auto", marginBottom: "8px" }}
      />
    )}
    <input
      type="text"
      placeholder="Image Label"
      value={img.label}
      onChange={(e) => {
        const newImages = [...form.images];
        newImages[idx].label = e.target.value;
        setForm({ ...form, images: newImages });
      }}
    />
  </div>
))}
<input
  type="file"
  onChange={async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await axios.post(`${API_BASE}/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const uploadedUrl = res.data.imageUrl;

      setForm((prev) => ({
        ...prev,
        images: [...prev.images, { url: uploadedUrl, label: "" }],
      }));
    } catch (error) {
      console.error("Image upload failed", error);
    }
  }}
/>




            <h4>Features</h4>
            <input placeholder="Interior Features (comma-separated)" value={form.features.interior.join(",")} onChange={e => setForm({ ...form, features: { ...form.features, interior: e.target.value.split(",") } })} />
            <input placeholder="Exterior Features (comma-separated)" value={form.features.exterior.join(",")} onChange={e => setForm({ ...form, features: { ...form.features, exterior: e.target.value.split(",") } })} />
            <select value={form.features.basement} onChange={e => setForm({ ...form, features: { ...form.features, basement: e.target.value } })}>
              <option value="Finished">Finished</option>
              <option value="Unfinished">Unfinished</option>
            </select>

            <h4>General Info</h4>
            <input placeholder="Property Address" value={form.generalInfo.propertyAddress} onChange={e => setForm({ ...form, generalInfo: { ...form.generalInfo, propertyAddress: e.target.value } })} />
          <select
          multiple
  value={form.generalInfo.propertyType}
  // onChange={e =>
  //   setForm({
  //     ...form,
  //     generalInfo: {
  //       ...form.generalInfo,
  //       propertyType: e.target.value,
  //     },
  //   })
  // }
   onChange={e =>
    setForm({
      ...form,
      generalInfo: {
        ...form.generalInfo,
        propertyType: Array.from(
          e.target.selectedOptions,
          option => option.value
        ),
      },
    })
  }
>
  <option value="">Select Property Type</option>
  <option value="hospital">Hospital</option>
  <option value="restaurant">Restaurant</option>
  <option value="school">School</option>
  <option value="mall">Mall</option>
  <option value="park">Park</option>
  <option value="gym">Gym</option>
</select>

            <input type="number" placeholder="Year Built" value={form.generalInfo.yearBuilt} onChange={e => setForm({ ...form, generalInfo: { ...form.generalInfo, yearBuilt: parseInt(e.target.value) } })} />
            <input placeholder="Square Footage" value={form.generalInfo.squareFootage} onChange={e => setForm({ ...form, generalInfo: { ...form.generalInfo, squareFootage: e.target.value } })} />
            <input type="number" placeholder="Bedrooms" value={form.generalInfo.numberOfBedrooms} onChange={e => setForm({ ...form, generalInfo: { ...form.generalInfo, numberOfBedrooms: parseInt(e.target.value) } })} />
            <input type="number" placeholder="Bathrooms" value={form.generalInfo.numberOfBathrooms} onChange={e => setForm({ ...form, generalInfo: { ...form.generalInfo, numberOfBathrooms: parseInt(e.target.value) } })} />
            <input type="number" placeholder="Floors" value={form.generalInfo.numberOfFloors} onChange={e => setForm({ ...form, generalInfo: { ...form.generalInfo, numberOfFloors: parseInt(e.target.value) } })} />

            <input placeholder="Map Location" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />

            {/* ✅ Nearby Radius */}
            <input
              type="number"
              placeholder="Nearby Radius (in meters)"
              value={form.radius}
              onChange={e => setForm({ ...form, radius: parseInt(e.target.value) || 0 })}
            />

            <br /><br />
            <button onClick={handleAddOrUpdateProperty}>{editMode ? "Update" : "Submit"} Property</button>
            <button onClick={() => { setShowModal(false); resetForm(); }}>Cancel</button>
          </div>
        </div>
      )}

      <hr />
      <h3>All Properties</h3>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
        {properties.map((prop) => (
          <div key={prop._id} style={{
            border: "1px solid #ccc", borderRadius: 8, padding: 16,
            width: 300, boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
          }}>
            <h4>{prop.title}</h4>
            <p><strong>Location:</strong> {prop.location}</p>
            <p><strong>Radius:</strong> {prop.radius || 0}m</p>
            <p style={{ fontSize: 14 }}>{prop.description}</p>
            <button onClick={() => handleEditProperty(prop)} style={{ marginRight: 10 }}>
              Edit
            </button>
            <button onClick={() => handleDeleteProperty(prop._id)} style={{ color: "red" }}>
              Delete
            </button>
          </div>
        ))}
      </div>

      <hr />
      <h3>All Users</h3>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
        {users.map((user) => (
          <div key={user._id} style={{
            border: "1px solid #ccc", borderRadius: 8, padding: 16,
            width: 350, boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
          }}>
            <p><strong>{user.email || user.facebookId || "Anonymous"}</strong></p>
            <p>Status: <span style={{ color: user.isBlocked ? "red" : "green" }}>
              {user.isBlocked ? "Blocked" : "Active"}
            </span></p>

            <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
              <button onClick={() => handleToggleBlockUser(user._id)}>
                {user.isBlocked ? "Unblock" : "Block"}
              </button>
              <button onClick={() => handleDeleteUser(user._id)} style={{ color: "red" }}>
                Remove
              </button>
            </div>

            <div>
              <strong>Property Status:</strong>
              {properties.map((property) => (
                <div key={property._id} style={{ marginBottom: 8 }}>
                  <div><em>{property.title}</em></div>
                 <select
  value={activityStatus[user._id]?.[property._id] || ""}
  onChange={(e) => handleStatusChange(user._id, property._id, e.target.value)}
  style={{ width: "60%" }}
>
  <option value="">Select Status</option>
  <option value="Visited">Visited</option>
</select>

<button onClick={() => saveStatus(user._id, property._id)} style={{ marginLeft: 5 }}>
  Save
</button>

<button
  onClick={() => deleteStatus(user._id, property._id)}
  style={{ marginLeft: 5, color: "red" }}
>
  Delete
</button>

                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPanel;
