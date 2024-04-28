/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { FixedSizeList as List } from "react-window";
import "./App.css";

function App() {
  const [result, setResult] = useState(Array<string>);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAllResults, setShowAllResults] = useState(false);
  const [numResultsToShow, setNumResultsToShow] = useState(100);
  const [listHeight, setListHeight] = useState(400);
  const [resultLen, setResultLen] = useState(0);
  const resultDiv = document.getElementById("result");

  function searchEngine(query: string, array: string[]) {
    const qReg = new RegExp(query, "i");

    return array
      .filter((item) => qReg.test(item))
      .sort((a, b) => {
        return a.search(qReg) - b.search(qReg);
      });
  }

  function isWord(value: string): boolean {
    const wordPattern = /^[A-Za-z]+$/;
    return wordPattern.test(value);
  }

  useEffect(() => {
    if (searchQuery.trim() !== "") handleSearch();
    else {
      setResultLen(0);
      resultDiv?.classList.add("empty");
    }
  }, [
    searchQuery,
    showAllResults,
    numResultsToShow,
    result,
    resultLen,
    resultDiv,
  ]);

  function handleSearch() {
    const searchValue = searchQuery.toLowerCase();
    fetch(
      "https://raw.githubusercontent.com/wuw-shz/Word-Search/main/src/assets/words.txt"
    )
      .then((res) => res.text())
      .then((words) => {
        const wordsSearch = searchEngine(
          searchValue.trim(),
          words
            .split("\n")
            .filter(
              (word) => word.toLowerCase().includes(searchValue) || isWord(word)
            )
        ).splice(0, showAllResults ? words.length - 1 : numResultsToShow);
        if (wordsSearch.length > 0) {
          setResult(wordsSearch);
          setResultLen(wordsSearch.length);
          resultDiv?.classList.remove("empty");
        } else {
          setResultLen(0);
          resultDiv?.classList.add("empty");
        }
      });
  }

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

  useEffect(() => {
    const updateListHeight = () => {
      const height = window.innerHeight - 270;
      setListHeight(height);
    };

    updateListHeight();
    window.addEventListener("resize", updateListHeight);
    return () => {
      window.removeEventListener("resize", updateListHeight);
    };
  }, []);

  return (
    <>
      <h1 onClick={() => window.location.reload()}>Word Search</h1>
      <div id="searchInputDiv">
        <input
          type="search"
          id="searchInput"
          placeholder="Search for a word..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="radio-buttons">
        <label
          className={showAllResults ? "radio-button selected" : "radio-button"}
        >
          <input
            type="radio"
            value="all"
            checked={showAllResults}
            onChange={() => setShowAllResults(true)}
          />
          <span>All Results</span>
        </label>
        <label
          className={!showAllResults ? "radio-button selected" : "radio-button"}
        >
          <input
            type="radio"
            value="limited"
            checked={!showAllResults}
            onChange={() => setShowAllResults(false)}
          />
          <span>Limited Results</span>
        </label>
        {!showAllResults && (
          <input
            type="number"
            placeholder="Number of results to show"
            value={numResultsToShow}
            onChange={(e) => setNumResultsToShow(parseInt(e.target.value))}
            className="limit-results-input"
          />
        )}
      </div>
      <p id="result-found" className="result-found">
        Results found ({resultLen})
      </p>
      <div id="result" className="result">
        {resultLen == 0 && "No words found."}
        <List
          height={listHeight}
          itemCount={resultLen}
          itemSize={20}
          width={"50%"}
        >
          {Row}
        </List>
      </div>
    </>
  );
}

export default App;
