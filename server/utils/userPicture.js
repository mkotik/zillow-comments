function effectiveUserPicture(user) {
  const profilePictureUrl = user?.profilePictureUrl || "";
  const profilePictureHidden = !!user?.profilePictureHidden;
  const googlePicture = user?.picture || "";
  return profilePictureHidden ? "" : profilePictureUrl || googlePicture;
}

module.exports = { effectiveUserPicture };
