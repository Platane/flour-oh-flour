import ParkMiller from "park-miller";

const pm = new ParkMiller(
  +(new URLSearchParams(window.location.search).get("seed") ?? 10)
);
Math.random = () => pm.floatInRange(0, 1);
