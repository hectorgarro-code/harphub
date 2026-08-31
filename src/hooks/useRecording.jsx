import { useState, useRef } from 'react';

export function useRecording() {
    const [isRecording, setIsRecording] = useState(false);
    const [recordings, setRecordings] = useState([]);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    const toggleRecording = async () => {
        if (isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        } else {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorderRef.current = new MediaRecorder(stream);
                audioChunksRef.current = [];

                mediaRecorderRef.current.ondataavailable = (event) => {
                    audioChunksRef.current.push(event.data);
                };

                mediaRecorderRef.current.onstop = () => {
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                    const url = URL.createObjectURL(audioBlob);
                    const filename = `HarpHub_Rec_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.webm`;
                    setRecordings(prev => [{ url, filename, timestamp: Date.now() }, ...prev]);
                    
                    // Stop all tracks to release the microphone
                    stream.getTracks().forEach(track => track.stop());
                };

                mediaRecorderRef.current.start();
                setIsRecording(true);
            } catch (err) {
                console.error("Error accessing microphone:", err);
                alert("No se pudo acceder al micrófono.");
            }
        }
    };

    return { isRecording, recordings, toggleRecording };
}
