import { useNavigate } from 'react-router-dom';

interface Props {
  disabled?: boolean;
}

export default function CheckoutButton({ disabled }: Props) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate('/checkout')}
      disabled={disabled}
      className="w-full rounded-full bg-rose-500 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:bg-rose-300"
    >
      Proceed to Checkout
    </button>
  );
}
