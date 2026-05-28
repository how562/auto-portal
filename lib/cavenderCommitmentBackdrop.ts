/** Background photos for the commitment memo page (flags & saluting service members). */

export type CommitmentBackdropPhotoId = "flag" | "salute";

export interface CommitmentBackdropPhoto {
  id: CommitmentBackdropPhotoId;
  src: string;
  alt: string;
}

export const CAVENDER_COMMITMENT_BACKDROP_PHOTOS: CommitmentBackdropPhoto[] = [
  {
    id: "flag",
    src: "/media/cavender-commitment/backdrop-american-flag.jpg",
    alt: "",
  },
  {
    id: "salute",
    src: "/media/cavender-commitment/backdrop-soldier-salute.jpg",
    alt: "",
  },
  {
    id: "flag",
    src: "/media/cavender-commitment/backdrop-american-flag-2.jpg",
    alt: "",
  },
  {
    id: "salute",
    src: "/media/cavender-commitment/backdrop-soldier-salute-2.jpg",
    alt: "",
  },
  {
    id: "flag",
    src: "/media/cavender-commitment/backdrop-american-flag.jpg",
    alt: "",
  },
  {
    id: "salute",
    src: "/media/cavender-commitment/backdrop-soldier-salute.jpg",
    alt: "",
  },
];
