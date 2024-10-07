export function EmptyScreen() {
  return (
    <div className="mx-auto max-w-3xl px-4 mb-36">
      <div className="flex flex-col items-center gap-4 rounded-lg border bg-background p-8 text-center">
        <h1 className="text-2xl font-bold">
          Welcome to the Product Inventory Chatbot
        </h1>
        <p className="text-muted-foreground">
          This intelligent assistant is here to provide you with expert answers
          and real-time information about our product inventory.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 w-full">
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold text-left">Key Features:</h2>
            <ul className="list-disc list-inside text-sm text-muted-foreground text-left">
              <li>Expert Assistance</li>
              <li>Real-Time Information</li>
              <li>User-Friendly Interaction</li>
              <li>Secure and Confidential</li>
            </ul>
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold text-left">How to Start:</h2>
            <p className="text-sm text-muted-foreground text-left">
              Simply type your questions below, and the chatbot will guide you
              with accurate and up-to-date responses to assist you in finding
              the information you need quickly and efficiently.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
