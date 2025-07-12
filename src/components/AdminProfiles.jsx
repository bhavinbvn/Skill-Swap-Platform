useEffect(async () => {
  const { data } = await supabase.from("profiles").select("*");
  setProfiles(data);
}, []);
