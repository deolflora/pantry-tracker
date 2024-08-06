"use client"
import React, {useState,useEffect} from "react";
//import { Box, Stack, Typography, Button, Modal, TextField } from '@mui/material'
import { firestore } from '@/firebase'
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  deleteDoc,
  getDoc,
  updateDoc
} from 'firebase/firestore'

// Unsplash API configuration
const UNSPLASH_ACCESS_KEY = "-Am6eXWGHi-FOG43B4ndfbAq_DKjAVL8IzZhjka_NXc"; 

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'white',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
}

export default function Home() {
  const [items, setItems] = useState([]);
  const [itemName, setItemName] = useState("");
  const [itemQuantity, setItemQuantity] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchPantryItems = async () => {
      const snapshot = query(collection(firestore, 'pantry'));
      const docs = await getDocs(snapshot);
      const pantryList = [];
      docs.forEach((doc) => {
        pantryList.push({ id: doc.id, ...doc.data() });
      });
      setItems(pantryList);
    };
    fetchPantryItems();
  }, []);

  const fetchImageUrl = async (query) => {
    try {
      const response = await fetch(`https://api.unsplash.com/search/photos?query=${query}+food&client_id=${"-Am6eXWGHi-FOG43B4ndfbAq_DKjAVL8IzZhjka_NXc"}`);
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        // Find the most relevant image based on the description or tags
        const relevantImage = data.results.find(result =>
          result.alt_description.toLowerCase().includes(query.toLowerCase()) ||
          result.tags.some(tag => tag.title.toLowerCase().includes(query.toLowerCase()))
        );
        return relevantImage ? relevantImage.urls.small : data.results[0].urls.small;
      }
    } catch (error) {
      console.error("Error fetching image: ", error);
    }
    return null; // Return null if no image found
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (itemName.trim() === "") return;
    const imageUrl = await fetchImageUrl(itemName);
    const newItem = {
      name: itemName,
      quantity: itemQuantity,
      imageUrl: imageUrl,
    };

    try {
      await setDoc(doc(firestore, "pantry", itemName), newItem);
      setItems([...items, { id: itemName, ...newItem }]);
      setItemName("");
      setItemQuantity(1);
    } catch (error) {
      console.error("Error adding item: ", error);
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      await deleteDoc(doc(firestore, "pantry", id));
      setItems(items.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Error deleting item: ", error);
    }
  };

  const handleUpdateQuantity = async (id, delta) => {
    try {
      const itemRef = doc(firestore, "pantry", id);
      const itemDoc = await getDoc(itemRef);

      if (itemDoc.exists()) {
        const currentQuantity = itemDoc.data().quantity;
        const newQuantity = Math.max(currentQuantity + delta, 0); // Ensure quantity is not negative

        await updateDoc(itemRef, { quantity: newQuantity });

        // Update local state
        setItems(items.map(item =>
          item.id === id ? { ...item, quantity: newQuantity } : item
        ));
      }
    } catch (error) {
      console.error("Error updating quantity: ", error);
    }
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="flex min-h-screen flex-col items-center justify-between sm:p-24 p-4">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl p-4 text-center">Pantry Tracker</h1>
        <div className="bg-slate-800 p-4 rounded-lg mb-4">
          <input
            className="w-full p-3 border rounded text-black"
            type="text"
            placeholder="Search for items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="bg-slate-800 p-4 rounded-lg">
          <form className="flex flex-col items-center gap-3 text-black" onSubmit={handleAddItem}>
            <div className="flex gap-3">
              <input
                className="p-3 border flex-grow"
                type="text"
                placeholder="Enter Item"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              />
              <input
                className="p-3 border flex-grow"
                type="number"
                placeholder="Enter Quantity"
                value={itemQuantity}
                onChange={(e) => setItemQuantity(Number(e.target.value))}
              />
            </div>
            <button
              className="text-white bg-slate-950 hover:bg-slate-900 p-3 text-xl mt-2"
              type="submit"
            >
              +
            </button>
          </form>
        </div>
        <div className="bg-slate-700 p-4 mt-4 rounded-lg w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <div key={item.id} className="flex flex-col items-center p-2 bg-white rounded-lg shadow-md">
                  {item.imageUrl && (
                    <img src={item.imageUrl} alt={item.name} className="w-32 h-32 object-cover rounded-md" />
                  )}
                  <div className="text-center mt-2">
                    <span className="font-bold text-black">{item.name}</span>
                    <div className="text-black">Quantity: {item.quantity}</div>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button
                      className="text-white bg-green-500 hover:bg-green-700 p-2 rounded"
                      onClick={() => handleUpdateQuantity(item.id, 1)}
                    >
                      +
                    </button>
                    <button
                      className="text-white bg-red-500 hover:bg-red-700 p-2 rounded"
                      onClick={() => handleUpdateQuantity(item.id, -1)}
                    >
                      -
                    </button>
                    <button
                      className="text-white bg-red-500 hover:bg-red-700 p-2 rounded"
                      onClick={() => handleDeleteItem(item.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-white col-span-full">No items in pantry</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}