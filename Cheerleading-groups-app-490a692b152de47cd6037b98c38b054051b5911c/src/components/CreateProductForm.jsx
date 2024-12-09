import { useState } from "react";
import {
  Button,
  Input,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";

function CreateProductForm({ groupId }) {
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("Fee");
  const [price, setPrice] = useState("");

  const handleAddProduct = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3000/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: productName,
          description,
          price: parseInt(price, 10), // Convert to integer
          groupId, // Pass the groupId when creating the product
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create product");
      }

      const result = await response.json();

      // Assuming `setProducts` updates the state for product listing

      // Optionally clear the input fields after adding the product
      setProductName("");
      setDescription("");
      setPrice("");

      window.location.reload();
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  return (
    <>
      {" "}
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1"></ModalHeader>
            <ModalBody>
              <form onSubmit={handleAddProduct}>
                <Input
                  label="Product Name"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  required
                />
                <Input
                  className="mt-4"
                  label="Price (in cents)"
                  value={price}
                  type="number"
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
                <Button type="submit" color="success" className="mt-10">
                  Add Fee
                </Button>
              </form>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </>
  );
}

export default CreateProductForm;
