
import argparse
from dataclasses import dataclass, field
import shutil
from wand.image import Image
from pathlib import Path
import json
import os

#   Three types of images:
#       - featured-images 3:1 format /post-title/width.jpg
#           * 1464x488
#           * 1208x403
#           * 952x317
#           * 767x256
#           * 300x100
#       - gallery name.jpg, thumbnail/name.jpg
#           * 650xY / Yx650, where Y > 650
#           * 350xY
#       - page-images 6:1 format /photo-title.jpg
#           * 1464x244
#  
#   src: raw-images
#   target: processed-images


@dataclass
class SiteData:
    key: str
    _package: dict = field(init=False)

    def __post_init__(self) -> None:
        with open("package.json", encoding = "utf-8") as f:
            self._package = json.load(f)

    @property
    def package(self) -> dict:
        return self._package

    @property
    def sitedata(self) -> dict:
        return self._package[self.key]

    @property
    def metadata(self) -> dict:
        return self._package[self.key]["metadata"]

    def get(self, path: str):
        """ This is at most 2 steps, since deeper can be problematic
            path: "scripts.test" or "metadata.sitename"
        """
        steps = path.split(".")
        
        if (steps[0] == self.key):
            start = self.sitedata
        
        elif (steps[0] == "metadata"):
            start = self.metadata
        else:
            start = self._package[steps[0]]

        # ex sitedata or metadata or scripts--though the first two are better as properties
        if (len(steps) == 1):
            return start
        
        # ex metadata.sitename or melindreamakes.gallery, scripts.test
        if (len(steps) == 2):
            return start[steps[1]]

        return

@dataclass
class ImageHandler:
    source: Path
    destination: Path
    imageData: dict
    verbose: bool = False
    clean: bool = False
    dryrun: bool = False
    _images: dict = field(init=False, default_factory=dict)
    _galleryData: dict = field(init=False, default_factory=dict)

    def print_info(self, to_print: str) -> None:
        """ Only prints noisy images if it's ran verbosely """
        if (self.verbose):
            print(to_print)

    def clean_directories(self) -> None:
        if self.clean:
            self.print_info("Removing destination data:")
            for data in self.imageData.values():
                image_directories = self.destination / data["startsWith"]
                self.print_info(f"* {image_directories}")

                if self.dryrun:
                    print(f"Dryrun: Deleting directory {image_directories}.")
                else:
                    # Delete it ...
                    if os.path.exists(image_directories):
                        shutil.rmtree(image_directories)

    def __post_init__(self) -> None:
        self.prepareGallery()
        self.clean_directories()

    def prepareGallery(self) -> None:
        """ Loads json with information about the gallery images. """
        metadataPath = self.source / "gallery-metadata.json"
        gallery = {
            "output" : {
                "destination": "gallery.json",
                "processed": {}
            }
        }

        with open(metadataPath, encoding = 'utf-8') as f:
            gallery["metadata"] = json.load(f)
        
        self._galleryData = gallery

    def isAspectRatio(self, width: int, height: int, ratio: str) -> bool:
        """ Given a width: x and a height: y and a ratio x:y, compare the aspect ratio """
        ratios = ratio.split(":")
        numericRatio = int(ratios[0])/int(ratios[1])
        imageRatio = width / height
        
        return round(imageRatio) == numericRatio

    def useFile(self, width: int, height: int, ratio: str) -> bool:
        """ To make the if easier/more readable. if there is no ratio then don't check for it"""
        if ratio is None:
            return True

        return self.isAspectRatio(width, height, ratio)
       
    def loadImages(self) -> dict:
        """ Loads images into a dictionary, sorted based on the directories they're in. """
        images = {}
        
        for imageContext, data in self.imageData.items():
            files = []
            startswith = data["startsWith"]
            fileglob = f"{startswith}/*.jpg"
            ratio = None
            if "ratio" in data:
                ratio = data["ratio"]
            for filename in list(self.source.glob(fileglob)):
                file = Image(filename =filename)
                
                if (self.useFile(file.width, file.height, ratio)):
                    filedata = {
                        "size": { "width": file.width, "height": file.height},
                        "file": file,
                        "filename": str(filename)
                    }
                    files.append(filedata)
                else:
                    print(f"File {filename} (width: {file.width}, height: {file.height}, ratio: {ratio}) was discarded from list of {imageContext} images as its size was off.")
            
            images[imageContext] = files

        self._images = images

    @property
    def images(self) -> dict:
        if not self._images:
            self.loadImages()

        return self._images

    def handle(self):
        """ Creates new files based on loaded images. """
        for key, files in self.images.items():
            # Need to figure out a destination, and a number of sizes
            sizes = self.imageData[key]["sizes"]
            destdir = self.destination / self.imageData[key]["startsWith"]
            do = f"handle{key.capitalize()}Image"

            if hasattr(self, do) and callable(func := getattr(self, do)):
                numericRatio = None
                calculateRatio = True
                if "ratio" in self.imageData[key]:
                    ratios = self.imageData[key]["ratio"].split(":")
                    numericRatio = int(ratios[0])/int(ratios[1])
                    calculateRatio = False
                
                for file in files:
                    if calculateRatio: # Calculate the ratio from the size
                        currentSize = file["size"]
                        numericRatio = currentSize["width"] / currentSize["height"]

                    func(destdir, file, sizes, numericRatio)

        self.saveGalleryMetadata()

    
    def saveGalleryMetadata(self):
        """ Saves the processed gallery into the destination (gallery.json) """
        output = self._galleryData["output"]
        destination = output["destination"]
                
        if self.dryrun:
            print(f"Dryrun: Write file {destination}")
            self.print_info(json.dumps(output["processed"], indent=4))
        else:
            with open(destination, "w") as write_file:
                json.dump(output["processed"], write_file, indent=4)

            self.print_info(f"Finished creating file {destination}")

    def create_destination_directories(self, destination_dirs = Path) -> None:
        """ Creates all directories in the Path destination_dirs """
        if not os.path.exists(destination_dirs):
            if self.dryrun:
                    print(f"Creating {destination_dirs}")
            else:
                os.makedirs(destination_dirs)


    def handleFeaturedImage(self, destdir: Path, file: dict, sizes: list[int], ratio: float) -> None:
        """ Featured images are named from their width and put in a directory named from the original image. """
        nameparts = os.path.basename(file["filename"]).split('.')
        basename = nameparts[0]
        extension = nameparts[1]
        destdir = destdir / basename
        
        self.create_destination_directories(destdir)
        
        for width in sizes:
            filename = destdir / f"{width}.{extension}"
            self.resizeImage(filename=filename, file=file, newWidth=width, ratio=ratio)
            

    def handlePageImage(self, destdir: Path, file: dict, sizes: list[int], ratio: float):
        """ Page images are just resized and keep their name in the new folder. """
        nameparts = os.path.basename(file["filename"]).split('.')
        basename = nameparts[0]
        extension = nameparts[1]
        
        self.create_destination_directories(destdir)
        
        for width in sizes:
            filename = destdir / f"{basename}.{extension}"
            self.resizeImage(filename=filename, file=file, newWidth=width, ratio=ratio)
        
    def handleGalleryImage(self, destdir: Path, file: dict, sizes: list[int], ratio: float):
        """ Gallery images are more complex than the other types:
            - Two files: 
                1. thumbnails/<filename> is width less than 400 (currently 350)
                2. <filename> has it's shorter side a specific size (currently 650) but the longer is aspected
            - Metadata from gallery-metadata.json is merged with the full sized image's size
        """
        slug = os.path.basename(file["filename"])
        nameparts = slug.split('.')
        basename = nameparts[0]
        extension = nameparts[1]
        
        thumbnailDir = destdir / "thumbnails"
        
        self.create_destination_directories(thumbnailDir)
        created = file["file"].metadata["date:create"]
        
        originalWidth = file['size']['width']
        originalHeight = file['size']['height']

        metadata = self._galleryData["metadata"].get(slug, { "creator": "", "description": "", "copyright": "", "title": ""})
        metadata["pubdate"] = created
        if slug not in self._galleryData["metadata"]:
            print(f"file {slug} is not in gallery-metadata.json")
        metadata["size"] = {}
        
        for size in sizes:
            if size > 400: #350 being thumbnail that has a set width, greater than that use size as the shorter of height/width
                filename = destdir / f"{basename}.{extension}"
                width = size if originalHeight >= originalWidth else self.getWidthFromHeightRatio(height=size, ratio=ratio)
                imageType = "full"
                #metadata["size"]["full"] = {
                #    "height": size if originalHeight <= originalWidth else self.getHeightFromWidthRatio(width=width, ratio=ratio),
                #    "width": width
                #}
            else: # Thumbnail
                filename = thumbnailDir / f"{basename}.{extension}"
                width = size
                imageType = "thumbnail"
                #metadata["size"]["full"] = {
                #    "height": size if originalHeight <= originalWidth else self.getHeightFromWidthRatio(width=width, ratio=ratio),
                #    "width": width
                #}
            
            sizeData = self.resizeImage(filename=filename, file=file, newWidth=width, ratio=ratio)

            if sizeData:
                metadata["size"][imageType] = sizeData
        
        self._galleryData["output"]["processed"][slug] = metadata

    def resizeImage(self, filename: str, file: dict, newWidth:float, ratio: float) -> dict:
        """ Using the given file and width, with height calculated from aspect ratio, create a file in destination, named filename. """
        try:
            
            height = self.getHeightFromWidthRatio(newWidth, ratio)
            output = f"File {filename} is created with size {newWidth}x{height}"
            if self.dryrun:
                print(f"Dryrun: {output}")
            else:
                newFile = file["file"].clone()
                newFile.resize(width=newWidth, height=height) 
                newFile.save(filename =filename)
                self.print_info(output)
        except Exception as e:
            print(f"Exception: {e}")
            return None

        return { "height": height, "width": newWidth}
    
    def getHeightFromWidthRatio(self, width: int, ratio: float) -> int:
        """ Helper function to get the height. """
        return round(width/ratio)

    def getWidthFromHeightRatio(self, height: int, ratio: float) -> int:
        """ Helper function to get the width. """
        return round(height*ratio)

    

def main():
    parser = argparse.ArgumentParser("images.py")
    
    parser.add_argument("-v", "--verbose", help="Prints all output.", action="store_true")
    parser.add_argument("-c", "--clean", help="Removes the old files in the build.", action="store_true")
    parser.add_argument("--dryrun", help="Dry run: prints out all actions intended", action="store_true")
    parser.add_argument("--key", help="Sets the key to use in package.json.")
    parser.add_argument("--src", help="Source directory; where the files are.")
    parser.add_argument("--dest", help="Destination directory; where the files should be copied to.")
    parser.add_argument("-f", "--file", help="Use this JSON config file with one or more values. Argument-specified keys take precedence over config.")
    falsey_when_included_args = []
    args = parser.parse_args()
    config_args = {}
    
    if args.file:
        with open(args.file, encoding = "utf-8") as f:
            config_args = json.load(f)
    
    # This overwrites the config_args[arg] with one given using arguments in call
    for c_arg in config_args:
        if hasattr(args, c_arg):
            arg = getattr(args, c_arg)
            if c_arg in falsey_when_included_args or arg:
                config_args[c_arg] = arg
    
    # Necessary args: key, src, dest
    key = config_args["key"] if "key" in config_args else args.key
    if key is None: # Key is given in neither
        raise ValueError("You need to give a key in either config file or via arguments")

    src = config_args["src"] if "src" in config_args else args.src
    if src is None: # src is given in neither
        raise ValueError("You need to give a source in either config file or via arguments")

    dest = config_args["dest"] if "dest" in config_args else args.dest
    if dest is None: # dest is given in neither
        raise ValueError("You need to give a destination in either config file or via arguments")

    verbose = config_args["verbose"] if "verbose" in config_args else args.verbose
    clean = config_args["clean"] if "clean" in config_args else args.clean
    dryrun = config_args["dryrun"] if "dryrun" in config_args else args.dryrun
    
    siteData = SiteData(key)
    source = Path(src)
    destination = Path(dest)
    
    imageHandler = ImageHandler(
        source=source,
        destination=destination,
        imageData=siteData.get("metadata.images"),
        verbose=verbose,
        clean=clean,
        dryrun=dryrun
    )
    imageHandler.handle()

    

if __name__ == "__main__":
    main()