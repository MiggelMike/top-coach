/// <reference lib="webworker" />

addEventListener('message', ({ data }) => {
  const response = {action: data};
  postMessage(response);
});
