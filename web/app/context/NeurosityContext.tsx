import { Neurosity } from "@neurosity/sdk";
import { createContext, useContext, useEffect, useState } from "react";

type NeurosityContextType = {
    device: Neurosity | null;
    calm: number;
  };

const NeurosityContext = createContext<NeurosityContextType  | null>(null);

export const NeurosityProvider = ({ children }: { children: React.ReactNode }) => {
    const [device, setDevice] = useState<Neurosity | null>(null);
    const [calm, setCalm] = useState(0);

    useEffect(() => {
        const neurosity = new Neurosity({ 
            deviceId: "deviceId" 
        });
        
        setDevice(neurosity);

        const subscription = neurosity.calm().subscribe((calm) => {
            setCalm(Number(calm.probability.toFixed(2)));
          });
      
          return () => {
            subscription.unsubscribe();
          };
      }, []);

      return (
        <NeurosityContext.Provider value={{device, calm}}>
          {children}
        </NeurosityContext.Provider>
      );
}

export const useNeurosity = () => {
    return useContext(NeurosityContext);
  };
