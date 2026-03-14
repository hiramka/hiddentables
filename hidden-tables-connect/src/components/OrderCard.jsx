export default function OrderCard({ order }) {
  return (
    <div className="border rounded-lg p-4 mb-4">
      <p className="font-bold">Order ID: {order.id}</p>
      <p>Status: {order.status}</p>
      <p>Total: KSh {order.total_price}</p>
      <div className="mt-2">
        {order.order_items.map(i => (
          <p key={i.id}>{i.menu_item_id} x {i.quantity} = KSh {i.price}</p>
        ))}
      </div>
    </div>
  );
}