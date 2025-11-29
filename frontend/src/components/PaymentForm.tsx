import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';

interface PaymentFormProps {
  onSubmit: (stripe: ReturnType<typeof useStripe>, elements: ReturnType<typeof useElements>) => Promise<void>;
  disabled?: boolean;
  error?: string | null;
  processing?: boolean;
}

export default function PaymentForm({ onSubmit, disabled, error, processing }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async () => {
    await onSubmit(stripe, elements);
  };

  return (
    <div className="space-y-3 rounded-2xl bg-white p-5 shadow">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Payment</h3>
        <span className="text-xs text-gray-500">Card payments are securely processed by Stripe.</span>
      </div>
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#1f2937',
                '::placeholder': { color: '#9ca3af' },
              },
              invalid: { color: '#dc2626' },
            },
          }}
        />
      </div>
      {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      <button
        disabled={!stripe || !elements || disabled || processing}
        onClick={handleSubmit}
        className="w-full rounded-lg bg-rose-500 px-4 py-2 text-center text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        {processing ? 'Processing payment...' : 'Place Order & Pay'}
      </button>
    </div>
  );
}
