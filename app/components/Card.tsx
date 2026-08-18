type CardProps = {
  titulo: string;
  valor: string;
};

export default function Card({ titulo, valor }: CardProps) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-gray-500">{titulo}</h2>

      <p className="text-3xl font-bold mt-2">
        {valor}
      </p>
    </div>
  );
}