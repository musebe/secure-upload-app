const cloudName = 'demo-article-projects'; // your cloud name
const uploadPreset = 'secure_malware_scan';

const uploadsContainer = document.getElementById('uploads_container');

// read initial status from upload result
function getModerationStatus(info) {
  const moderation = info.moderation && info.moderation[0];

  if (!moderation) return 'pending';

  if (moderation.status === 'approved') return 'approved';
  if (moderation.status === 'rejected') return 'rejected';

  return 'pending';
}

function updateStatusChip(item, status, info) {
  const chip = item.querySelector('.status-chip');

  chip.classList.remove('status-safe', 'status-pending', 'status-blocked');

  if (status === 'approved') {
    chip.classList.add('status-safe');
    chip.textContent = 'Safe';

    const existingThumb = item.querySelector('img.upload-thumb');
    const placeholder = item.querySelector('div.upload-thumb');

    if (!existingThumb && placeholder && info.resource_type === 'image') {
      const img = document.createElement('img');
      img.src = info.secure_url;
      img.alt = info.original_filename || info.public_id;
      img.className = 'upload-thumb';
      placeholder.replaceWith(img);
    }
  } else if (status === 'rejected') {
    chip.classList.add('status-blocked');
    chip.textContent = 'Blocked';
  } else {
    chip.classList.add('status-pending');
    chip.textContent = 'Pending scan';
  }
}

function buildUploadItem(info, status) {
  const item = document.createElement('div');
  item.className = 'upload-item';
  item.dataset.publicId = info.public_id;

  const thumb = document.createElement('div');
  thumb.className = 'upload-thumb';

  const meta = document.createElement('div');
  meta.className = 'upload-meta';

  const name = document.createElement('p');
  name.className = 'upload-name';
  name.title = info.original_filename || info.public_id;
  name.textContent = info.original_filename || info.public_id;

  const details = document.createElement('p');
  details.className = 'upload-details';
  const sizeKb = Math.round(info.bytes / 1024);
  details.textContent = `${info.resource_type} • ${
    info.format || 'file'
  } • ${sizeKb} KB`;

  meta.appendChild(name);
  meta.appendChild(details);

  const chip = document.createElement('span');
  chip.className = 'status-chip';

  item.appendChild(thumb);
  item.appendChild(meta);
  item.appendChild(chip);

  updateStatusChip(item, status, info);

  return item;
}

// poll Cloudinary until status is no longer pending
function startStatusPolling(info, item) {
  const publicId = info.public_id;

  const poll = async () => {
    try {
      const res = await fetch(`/api/status/${encodeURIComponent(publicId)}`);

      if (!res.ok) {
        console.error('Status API error:', res.status);
        return;
      }

      const data = await res.json();
      console.log('Status poll result:', publicId, data);

      if (!data.status || data.status === 'pending') {
        // try again in 4 seconds
        setTimeout(poll, 4000);
        return;
      }

      // approved or rejected
      updateStatusChip(item, data.status, info);
    } catch (err) {
      console.error('Status check failed', err);
      setTimeout(poll, 4000);
    }
  };

  // start first poll
  poll();
}

const uploadWidget = cloudinary.createUploadWidget(
  {
    cloudName: cloudName,
    uploadPreset: uploadPreset,
    folder: 'secure_malware_scan',
    sources: ['local', 'url', 'camera', 'google_drive'],
    multiple: true,
    maxFiles: 10,
    showAdvancedOptions: false,
  },
  (error, result) => {
    if (error) {
      console.error('Upload widget error:', error);
      return;
    }

    if (!result || result.event !== 'success') return;

    const info = result.info;
    console.log('Upload complete:', info);

    const emptyState = uploadsContainer.querySelector('.empty-state');
    if (emptyState) emptyState.remove();

    const initialStatus = getModerationStatus(info);
    const item = buildUploadItem(info, initialStatus);

    uploadsContainer.prepend(item);

    // keep checking Cloudinary until status changes
    startStatusPolling(info, item);
  }
);

document.addEventListener('DOMContentLoaded', () => {
  const uploadButton = document.getElementById('upload_button');

  uploadButton.addEventListener('click', () => {
    uploadWidget.open();
  });
});
