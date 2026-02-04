const { useState } = React;

function App() {
  const [contract, setContract] = useState('');
  const [value, setValue] = useState('');
  const [result, setResult] = useState('');

  const queryStorage = async () => {
    if (!contract) return alert("Enter contract address!");
    try {
      const res = await fetch(`/storage?contract_address=${contract}`);
      const data = await res.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (e) {
      setResult("Error: " + e.message);
    }
  };

  const updateStorage = async () => {
    if (!contract || !value) return alert("Enter contract address and value!");
    try {
      const res = await fetch(`/storage/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contract_address: contract, value })
      });
      const data = await res.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (e) {
      setResult("Error: " + e.message);
    }
  };

  return (
    React.createElement("div", {},
      React.createElement("h1", {}, "GenLayer StudioNet UI"),
      React.createElement("input", { placeholder: "Contract Address", value: contract, onChange: e => setContract(e.target.value) }),
      React.createElement("input", { placeholder: "Value to Update", value: value, onChange: e => setValue(e.target.value) }),
      React.createElement("button", { onClick: queryStorage }, "Query Storage"),
      React.createElement("button", { onClick: updateStorage }, "Update Storage"),
      React.createElement("pre", {}, result)
    )
  );
}

ReactDOM.render(React.createElement(App), document.getElementById('root'));
