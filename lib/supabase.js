import {createClient} from "@supabase/supabase-js";

const supabaseClient = createClient('https://repfezfjwchqlrkatwta.supabase.co', process.env["SUPABASE_KEY"])

export default supabaseClient;
