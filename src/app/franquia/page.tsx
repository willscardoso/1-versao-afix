export const metadata = {
  title: 'Franquia - AFIX',
  description: 'Informações sobre a franquia AFIX',
}

export default function FranquiaPage() {
  return (
    <div className="min-h-screen bg-white">
      <main className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold mb-4">Franquia AFIX</h1>
            <p className="text-gray-700 mb-6">Aqui ficam as informações sobre como funciona a franquia AFIX, requisitos, benefícios e como se candidatar.</p>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-xl font-semibold mb-2">Por que ser um franqueado?</h2>
                <p className="text-gray-600">Explicação breve dos benefícios de fazer parte da rede AFIX.</p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-2">Como funciona</h2>
                <p className="text-gray-600">Passos para adesão, suporte e o modelo de negócio.</p>
              </div>
            </section>

            <div className="mt-8">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md">Quero saber mais</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
