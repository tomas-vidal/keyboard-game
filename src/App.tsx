import { KeyboardEvent, useEffect, useState, useRef } from "react";
import { generate } from "random-words";
const START_COUNTER = 60;
const WORDS = 80;

function App() {
  const [counter, setCounter] = useState<number>(START_COUNTER);
  const [words, setWords] = useState<string[]>([]);
  const [currWordIdx, setCurrWordIdx] = useState<number>(0);
  const [actualWord, setActualWord] = useState<string>("");
  const [correct, setCorrect] = useState<number>(0);
  const [incorrect, setIncorrect] = useState<number>(0);
  const [started, setStarted] = useState<boolean>(false);
  const interval = useRef<number>();
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setWords(generateRandomWords(WORDS));
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
    if (keyCode === 32) {
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
  };

  const resetGame = (): void => {
    setCounter(START_COUNTER);
    setCorrect(0);
    setIncorrect(0);
    loadWords();
    setCurrWordIdx(0);
  };

  return (
    <>
      <main className="font-mono w-full h-screen bg-gray-700 flex text-green-400">
        <div className="w-[70%] m-auto text-center">
          <h1 className="text-3xl font-bold mb-4">{counter}</h1>
          <input
            ref={input}
            className="block p-2.5 w-full text-sm  rounded-lg border text-black resize-none focus:ring-2 focus:ring-green-500 focus:outline-none"
            placeholder="Write here..."
            type="text"
            value={actualWord}
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

          <div className="mt-5 text-left break-words">
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
          <section className="mt-10 mb-3 flex justify-around text-white">
            <div>
              <h2 className="text-4xl">Correct</h2>
              <p className="text-8xl">{correct}</p>
            </div>
            <div>
              <h2 className="text-4xl">Incorrect</h2>
              <p className="text-8xl">{incorrect}</p>
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
              <p className="text-8xl">{(correct / 60).toFixed(2)}</p>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

export default App;
