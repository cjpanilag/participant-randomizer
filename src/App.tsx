import React, { useState, useEffect } from "react";
import Confetti from "react-confetti";

type Participant = {
  id: number;
  uuid: string;
  name: string;
  email: string;
  created_at: string;
};

const API_URL = "http://localhost:3000/api";
// const API_URL = "https://event-form-flax.vercel.app/api";

const App: React.FC = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [winner, setWinner] = useState<Participant | null>(null);
  const [isRandomizing, setIsRandomizing] = useState<boolean>(false);
  const [animateName, setAnimateName] = useState<string | null>(null);
  const [confettiVisible, setConfettiVisible] = useState<boolean>(false);
  const [isOnRandomizeMode, setIsOnRandomizeMode] = useState<boolean>(false);

  const fetchParticipants = () => {
    fetch(`${API_URL}/participants`)
      .then((res) => res.json())
      .then((data) => {
        const mappedResult = data.map((participant: any, index: number) => ({
          ...participant,
          id: index + 1,
          uuid: participant.id,
          created_at: new Date(participant.created_at).toLocaleString("en-US", {
            timeZone: "Asia/Manila",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
          }),
        }));
        setParticipants(mappedResult);
      })
      .catch((err) => {
        console.log(err.json());
      });
  };

  useEffect(() => {
    fetchParticipants();
  }, []);

  const randomize = () => {
    if (participants.length === 0) return;

    setIsOnRandomizeMode(true);
    setIsRandomizing(true);
    setWinner(null);
    setConfettiVisible(false);

    // Animate names for 3 seconds
    const duration = 3000;
    const interval = 150;
    const endTime = Date.now() + duration;

    const randomizeInterval = setInterval(() => {
      if (Date.now() > endTime) {
        clearInterval(randomizeInterval);
        const selectedWinner =
          participants[Math.floor(Math.random() * participants.length)];
        setWinner(selectedWinner);
        setConfettiVisible(true);
        setIsRandomizing(false);
        setAnimateName(null);
        return;
      }
      setAnimateName(
        participants[Math.floor(Math.random() * participants.length)].name,
      );
    }, interval);
  };

  useEffect(() => {
    if (winner !== null) {
      console.log("winner", winner);
      fetch(`${API_URL}/participants`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: winner.uuid,
          status: 0,
        }),
      })
        .then((response) => response.json())
        .then((data) => console.log(data))
        .catch((error) => console.error("Error:", error));
    }
  }, [winner]);

  const Form: React.FC = () => {
    return (
      <React.Fragment>
        <div className="flex gap-2">
          <div className="card bg-opacity-50 bg-white/30 backdrop-blur-md shadow-xl border border-white/20 max-w-[15rem]">
            <div className="card-body items-left text-center">
              <h1 className="text-white/60 font-light text-md">Participants</h1>
              <h3 className="text-black/70 font-bold text-2xl">
                {participants.length}
              </h3>
            </div>
          </div>
          <div className="flex-1"></div>
          <div className="flex items-center justify-center">
            <button className="btn mt-20" onClick={randomize}>
              Randomize
            </button>
          </div>
        </div>

        <div className="card bg-opacity-50 bg-white/30 backdrop-blur-md shadow-xl border border-white/20">
          <div className="card-body overflow-x-auto items-left text-center">
            <table className="table">
              {/* head */}
              <thead>
                <tr className="text-black/70 text-2xl">
                  <th></th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((participant) => (
                  <tr className="text-black/60 text-xl" key={participant.id}>
                    <React.Fragment>
                      <th>{participant.id}</th>
                      <td>{participant.name}</td>
                      <td>{participant.email}</td>
                      <td>{participant.created_at}</td>
                    </React.Fragment>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </React.Fragment>
    );
  };

  const RandomizerForm: React.FC = () => {
    return (
      <React.Fragment>
        <div className="card flex-1">
          <div className="card-body items-center text-center">
            <div className="h-64">
              {isRandomizing ? (
                <h3 className="text-white text-6xl animate-pulse">
                  {animateName}
                </h3>
              ) : (
                winner && (
                  <React.Fragment>
                    <h4 className="text-xl text-white/50 mb-6">
                      Congratulations
                    </h4>
                    <h3 className="text-6xl font-bold text-black/70 animate-heartbeat">
                      {winner.name}
                    </h3>
                  </React.Fragment>
                )
              )}
              {winner && (
                <div className="mt-14">
                  <button
                    className="btn btn-md w-80"
                    onClick={() => {
                      setConfettiVisible(false);
                      setIsOnRandomizeMode(false);
                      fetchParticipants();
                    }}
                  >
                    Back
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
      {confettiVisible && <Confetti />}
      <div className="container grid grid-col-2 gap-2 mx-auto max-w-[80rem] p-6">
        {!isOnRandomizeMode ? <Form /> : <RandomizerForm />}
      </div>
    </div>
  );
};

export default App;
