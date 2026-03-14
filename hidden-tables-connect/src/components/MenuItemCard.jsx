export default function MenuItemCard({ item, addToCart }) {
  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition">
      <h3 className="font-bold text-lg">{item.name}</h3>
      <p className="text-gray-600">{item.category}</p>
      <p className="mt-2 font-semibold">KSh {item.price}</p>
      <button
        className="mt-2 bg-orange-600 text-white px-4 py-1 rounded hover:bg-orange-700"
        onClick={() => addToCart(item)}
      >
        Add to Cart
      </button>
    </div>
  );
}