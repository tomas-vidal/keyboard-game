import { KeyboardEvent, useEffect, useState, useRef } from "react";
import { generate } from "random-words";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  addDoc,
  onSnapshot,
  doc,
} from "firebase/firestore";
import { UserDB } from "./types/User";

const firebaseConfig = {
  apiKey: "AIzaSyBPLgrqsCoi9ZIH8zWqiorCXVrm0CYhkSw",
  authDomain: "keyboard-game-769c1.firebaseapp.com",
  projectId: "keyboard-game-769c1",
  storageBucket: "keyboard-game-769c1.appspot.com",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function getLeaderboard(db: any) {
  const leaderboard = query(
    collection(db, "leaderboard"),
    orderBy("wps", "desc"),
    limit(3)
  );
  const leaderboardSnapshot = await getDocs(leaderboard);
  const leaderboardList = leaderboardSnapshot.docs.map((doc) => doc.data());
  return leaderboardList;
}

const START_COUNTER = 60;
const WORDS = 200;

function App() {
  const [counter, setCounter] = useState<number>(START_COUNTER);
  const [words, setWords] = useState<string[]>([]);
  const [currWordIdx, setCurrWordIdx] = useState<number>(0);
  const [actualWord, setActualWord] = useState<string>("");
  const [correct, setCorrect] = useState<number>(0);
  const [incorrect, setIncorrect] = useState<number>(0);
  const [started, setStarted] = useState<boolean>(false);
  const [leaderboard, setLeaderboard] = useState<UserDB[]>([]);
  const interval = useRef<NodeJS.Timeout>();
  const input = useRef<HTMLInputElement>(null);
  const modal = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    setWords(generateRandomWords(WORDS));

    onSnapshot(
      query(collection(db, "leaderboard"), orderBy("wps", "desc"), limit(3)),
      (querySnapshot) => {
        const newDocs: UserDB[] = [];
        querySnapshot.forEach((doc) => {
          newDocs.push(doc.data() as UserDB);
        });
        setLeaderboard(newDocs);
        console.log(newDocs);
      }
    );
  }, []);

  useEffect(() => {
    if (started) input.current?.focus();
    setActualWord("");
  }, [started]);

  const loadWords = () => {
    setWords(generateRandomWords(WORDS));
  };

  const generateRandomWords = (length: number): string[] => {
    return generate(length) as string[];
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    const keyCode = e.nativeEvent.keyCode;
    if (keyCode === 32 || keyCode === 13) {
      const result = compareWords();
      result ? setCorrect(correct + 1) : setIncorrect(incorrect + 1);
      setCurrWordIdx(currWordIdx + 1);
      setActualWord("");
    }
  };

  const compareWords = (): boolean => {
    const wordToCompare = words[currWordIdx];
    return wordToCompare === actualWord.trim();
  };

  const startGame = (): void => {
    resetGame();
    interval.current = setInterval(() => {
      setCounter((prevCounter) => {
        if (prevCounter === 0) {
          setStarted(false);
          clearIntervalCounter();
          modal.current?.showModal();
          return START_COUNTER;
        }
        return prevCounter - 1;
      });
    }, 1000);
    setStarted(true);
    if (input.current) input.current.focus();
  };

  const clearIntervalCounter = () => {
    clearInterval(interval.current);
  };

  const stopGame = (): void => {
    setStarted(false);
    clearIntervalCounter();
    resetGame();
  };

  const resetGame = (): void => {
    setCounter(START_COUNTER);
    setCorrect(0);
    setIncorrect(0);
    loadWords();
    setCurrWordIdx(0);
  };

  const handleSubmitScore = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    const formElement = e.currentTarget;
    const formData = new FormData(formElement);
    const username = formData.get("username");
    e.currentTarget.reset();
    await addDoc(collection(db, "leaderboard"), {
      username,
      wps: (correct / START_COUNTER).toFixed(2),
      accurancy: Math.round((correct / (correct + incorrect)) * 100),
      correct,
      incorrect,
    });
  };

  return (
    <>
      <main className="font-mono w-full h-screen bg-gray-700 flex text-green-400">
        <div className="w-[70%] m-auto text-center">
          <h1 role="counter" className="text-3xl font-bold mb-4">
            {counter}
          </h1>
          <input
            ref={input}
            className="block p-2.5 w-full text-sm  rounded-lg border text-black resize-none focus:ring-2 focus:ring-green-500 focus:outline-none"
            placeholder="Write here..."
            type="text"
            value={actualWord}
            role="input-text"
            onChange={(evt) => setActualWord(evt.currentTarget.value)}
            onKeyDown={(e) => handleKeyDown(e)}
            disabled={started ? false : true}
          ></input>
          {started ? (
            <>
              <button
                className="rounded-lg mt-2 border-2 p-2.5 w-full text-white font-bold"
                onClick={stopGame}
              >
                STOP GAME
              </button>
            </>
          ) : (
            <>
              <button
                className="rounded-lg mt-2 border-2 p-2.5 w-full text-white font-bold"
                onClick={startGame}
              >
                START
              </button>
            </>
          )}
          <dialog ref={modal} className="rounded-lg shadow bg-gray-700 w-1/2">
            <h2 className="py-3 px-4 text-xl font-semibold text-white border-b rounded-t border-gray-600">
              Submit score
            </h2>
            <form
              className="flex gap-3 mt-4 mx-10"
              onSubmit={handleSubmitScore}
            >
              <input
                type="text"
                name="username"
                className="flex-1 rounded-sm px-4"
                placeholder="write your username"
              />
              <button
                type="submit"
                className="bg-white rounded-sm px-4 py-2"
                onClick={() => modal.current?.close()}
              >
                Enter
              </button>
            </form>
            <button
              onClick={() => modal.current?.close()}
              className="px-4 py-2 my-3 border rounded-sm text-red-500 font-bold border-red-500"
            >
              Close
            </button>
          </dialog>
          <div className="mt-5 text-left break-words" role="text-generator">
            {words.map((word, idx) => {
              return (
                <>
                  <span
                    className={
                      currWordIdx === idx
                        ? "bg-white rounded-sm font-bold px-2 text-green-800"
                        : "text-blue"
                    }
                    key={idx}
                  >
                    {word}
                  </span>
                  <span> </span>
                </>
              );
            })}
          </div>
          <section className="mt-10 mb-3 flex flex-wrap justify-around text-white">
            <div>
              <h2 className="text-4xl">Correct</h2>
              <p className="text-8xl" role="correct-counter">
                {correct}
              </p>
            </div>
            <div>
              <h2 className="text-4xl">Incorrect</h2>
              <p className="text-8xl" role="incorrect-counter">
                {incorrect}
              </p>
            </div>
            <div>
              <h2 className="text-4xl">Accurancy</h2>
              <p className="text-8xl">
                {correct !== 0
                  ? `${Math.round((correct / (correct + incorrect)) * 100)}%`
                  : 0}
              </p>
            </div>
            <div>
              <h2 className="text-4xl">WPS</h2>
              <p className="text-8xl">{(correct / START_COUNTER).toFixed(2)}</p>
            </div>
          </section>
          <section className="mt-10 text-white">
            <h1 className="font-bold ">Leaderboard (top 3)</h1>
            <table className="w-full mt-2 text-sm">
              <thead className="uppercase  text-gray-400 bg-gray-800">
                <tr>
                  <th className="px-6 py-3">Rank</th>
                  <th className="px-6 py-3">Username</th>
                  <th className="px-6 py-3">WPS</th>
                  <th className="px-6 py-3">Accurancy</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((user, idx) => {
                  return (
                    <tr className="border-b bg-gray-600 text-white whitespace-nowrap">
                      <th className="px-6 py-4">{idx + 1}</th>
                      <th className="px-6 py-4 font-bold">{user.username}</th>
                      <th className="px-6 py-4">{user.wps}</th>
                      <th className="px-6 py-4">{user.accurancy}%</th>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
        </div>
      </main>
    </>
  );
}

export default App;
