import init, { InitOutput, Universe } from "life-game";

init().then((wasm: InitOutput) => {
  const pre = document.getElementById("game-of-life-canvas");
  const universe = Universe.new();

  const renderLoop = () => {
    const frame_per_second: number = 10;
    setTimeout(() => {
      pre.textContent = universe.render();
      universe.update();

      requestAnimationFrame(renderLoop);
    }, 1000 / frame_per_second);
  };

  requestAnimationFrame(renderLoop);
});
