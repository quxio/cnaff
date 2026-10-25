import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";

// TODO: check for name conflicts / invalid names while creating/changing account details

import { DataModel } from "./_generated/dataModel";
const customAuthProvider = Password<DataModel>({
  profile (params) {
    return {
      email: params.email as string,
      name: params.name as string,
      bio: "",
      image: null,
      fallbackHue: BigInt(Math.floor(Math.random()*360)),
    }
  }
})

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [customAuthProvider], // was 'providers: [password]'
});
