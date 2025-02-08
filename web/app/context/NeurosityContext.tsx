import { Neurosity } from "@neurosity/sdk";
import { createContext, useContext, useEffect, useState } from "react";

const NeurosityContext = createContext<Neurosity | null>(null);

export const NeurosityProvider = ({ children }: { children: React.ReactNode }) => {
    const [device, setDevice] = useState<Neurosity | null>(null);
    
    useEffect(() => {
        const neurosity = new Neurosity({ 
            deviceId: "deviceId" 
        });
        
        setDevice(neurosity);
        
      }, []);

      return (
        <NeurosityContext.Provider value={device}>
          {children}
        </NeurosityContext.Provider>
      );
}

export const useNeurosity = () => {
    return useContext(NeurosityContext);
  };
