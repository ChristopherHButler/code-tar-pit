import React, { useState, useEffect, useRef } from 'react';
import bundle from 'unpkg-bundler';

const App = () => {
  const iframe = useRef();

  const src = 
`
  <html>
    <head>
      <style>html { background-color: white; }</style>
    </head>
    <body>
      <div id="root"></div>
      <script>
        const handleError = (err) => {
          const root = document.querySelector('#root');
          root.innerHTML = '<div style=" position: absolute; top: 10px; left: 10px; color: red;"><h4>Runtime Error</h4>' + err + '</div>';
          console.error(err);
        };
        window.addEventListener('error', (event) => {
          event.preventDefault();
          handleError(event.error);
        });
        window.addEventListener('message', (event) => {
          try {
            eval(event.data);
          } catch (err) {
            handleError(err);
          }
        }, false);
      </script>
    </body>
  </html>
`;

  const [input, setInput] = useState('');
  const [code, setCode] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    iframe.current.srcdoc = src;
    setTimeout(() => {
      iframe.current.contentWindow.postMessage(code, '*');
    }, 50);

  }, [code, src]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      const { code, err } = await bundle(input);
      setCode(code);
      setErr(err);
    }, 750);

    return () => {
      clearTimeout(timer);
    };
  }, [input]);

  return (
    <div>
      <div>
        <h1>Code Tar Pit</h1>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', height: '50vh', width: '100%', border: '1px solid red' }}>
        <div style={{ display: 'flex', flexDirection: 'row', height: '100%', width: '100%' }}>
          <textarea
            rows={10}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{ width: '100%' }}
          />
          <iframe
            ref={iframe}
            srcDoc={src}
            title="preview"
            sandbox="allow-scripts"
            style={{ width: '100%' }}
          />
          {err && <div>{err}</div>}
        </div>
      </div>
    </div>
  );
}

export default App;
