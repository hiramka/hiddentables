export default function CartItem({ item, removeFromCart }) {
  return (
    <div className="flex justify-between items-center p-2 border-b">
      <div>
        <p className="font-bold">{item.name}</p>
        <p>KSh {item.price} x {item.quantity}</p>
      </div>
      <button onClick={() => removeFromCart(item.id)} className="text-red-600 font-bold">Remove</button>
    </div>
  );
}