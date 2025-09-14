import { increment, decrement } from "@/redux/slices/authSlice";
import { useAppDispatch, useAppSelector } from "../hooks/redux";

function Home() {
  const count = useAppSelector((state) => state.auth.count);
  const dispatch = useAppDispatch();

  return (
    <div style={{ textAlign: "center", marginTop: 40 }}>
      <h1>Home Page</h1>
      <p>Count: {count}</p>
      <button onClick={() => dispatch(increment())}>+ Increment</button>
      <button onClick={() => dispatch(decrement())}>- Decrement</button>
    </div>
  );
}

export default Home;
