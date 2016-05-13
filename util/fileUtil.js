exports.generateCacheName = function(imageSize, imageName) {
  return imageSize + '_' + imageName.replace('/','_');
};