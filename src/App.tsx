/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { FixedSizeList as List } from "react-window";
import "./App.css";

function App() {
  const [result, setResult] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [limitedResults, setLimitedResults] = useState(false);
  const [numResults, setNumResults] = useState(100);
  const [listHeight, setListHeight] = useState(400);
  const [resultLen, setResultLen] = useState(0);
  const [minLength, setMinLength] = useState(0);
  const [maxLength, setMaxLength] = useState(100);
  const [startLetter, setStartLetter] = useState("");
  const [optionsToggle, setOptionsToggle] = useState(false);
  const resultDiv = document.getElementById("result");

  useEffect(() => {
    if (searchQuery.trim() !== "") handleSearch();
    else {
      setResultLen(0);
    }
  }, [
    searchQuery,
    limitedResults,
    numResults,
    minLength,
    maxLength,
    startLetter,
    handleSearch,
  ]);

  function handleSearch() {
    const searchValue = searchQuery.toLowerCase();
    fetch(
      "https://raw.githubusercontent.com/wuw-shz/Word-Search/main/src/assets/words.txt"
    )
      .then((res) => res.text())
      .then((words) => {
        const wordsSearch = searchEngine(searchValue.trim(), words.split("\n"));
        setResult(wordsSearch);
        setResultLen(wordsSearch.length);
      });
  }

  function searchEngine(query: string, array: string[]) {
    const qReg = new RegExp(query, 'i')
    // const qReg = new RegExp(`\\w+(${query})\\w+`, "gi")

    return array
      .filter((item) => {
        const searchLen = item.length >= minLength && item.length <= maxLength;
        return (
          qReg.test(item) &&
          searchLen &&
          (startLetter
            ? item.toLowerCase().startsWith(startLetter.toLowerCase())
            : true)
        );
      })
      .sort((a, b) => a.search(qReg) - b.search(qReg))
      .splice(0, limitedResults ? numResults : array.length - 1);
  }

  useEffect(() => {
    const updateListHeight = () => {
      const height =
        window.innerHeight -
        (optionsToggle ? (limitedResults ? 520 : 480) : 280);
      setListHeight(height);
    };

    updateListHeight();
    window.addEventListener("resize", updateListHeight);
    return () => {
      window.removeEventListener("resize", updateListHeight);
    };
  }, [optionsToggle, limitedResults]);

  const Row = ({
    index,
    style,
  }: {
    index: number;
    style: React.CSSProperties;
  }): JSX.Element => {
    const item: string = result[index];
    if (!item) {
      resultDiv?.classList.add("empty");
      setResultLen(0);
      return <div>No words found.</div>;
    }
    return <div style={style}>{item}</div>;
  };
  return (
    <>
      <div>
        <h1 onClick={() => window.location.reload()}>Words Search</h1>
      </div>
      <br></br>
      <div id="searchInputDiv">
        <input
          type="search"
          id="searchInput"
          placeholder="Search for a word..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <details
        className="custom-options"
        id="custom-options"
        onToggle={() =>
          setOptionsToggle(
            (document.getElementById("custom-options") as HTMLDetailsElement)
              .open
          )
        }
        open
      >
        <summary>Options</summary>
        <div className="custom-dropdown-content">
          <label>
            Min Length
            <input
              type="number"
              value={minLength}
              onChange={(e) => setMinLength(parseInt(e.target.value))}
            />
          </label>
          <label>
            Max Length
            <input
              type="number"
              value={maxLength}
              onChange={(e) => setMaxLength(parseInt(e.target.value))}
            />
          </label>
          <label>
            Start Letter
            <input
              type="text"
              value={startLetter}
              onChange={(e) => setStartLetter(e.target.value)}
            />
          </label>
          <label className="toggle-switch">
            Limited Results
            <div className="checkbox-wrapper-51">
              <input
                id="cbx-51"
                type="checkbox"
                checked={limitedResults}
                onChange={(e) => setLimitedResults(e.target.checked)}
              />

              <label className="toggle" htmlFor="cbx-51">
                <span>
                  <svg viewBox="0 0 10 10" height="10px" width="10px">
                    <path d="M5,1 L5,1 C2.790861,1 1,2.790861 1,5 L1,5 C1,7.209139 2.790861,9 5,9 L5,9 C7.209139,9 9,7.209139 9,5 L9,5 C9,2.790861 7.209139,1 5,1 L5,9 L5,1 Z"></path>
                  </svg>
                </span>
              </label>

              {limitedResults && (
                <input
                  type="number"
                  value={numResults}
                  onChange={(e) =>
                    setNumResults(parseInt(e.target.value))
                  }
                  className="limit-results-input"
                />
              )}
            </div>
          </label>
        </div>
      </details>
      <p id="result-found" className="result-found">
        Results found (
        {resultLen.toLocaleString()} / 307,657)
      </p>
      <div id="result" className="result">
        <List
          height={listHeight}
          itemCount={resultLen}
          itemSize={20}
          width={"100%"}
        >
          {Row}
        </List>
      </div>
    </>
  );
}

export default App;
